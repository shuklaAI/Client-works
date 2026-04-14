const { supabase } = require('../config/db');

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/:productId
exports.getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;

    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select('*, user:user_id(id, name, avatar)', { count: 'exact' })
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    // Rating distribution (1–5)
    const { data: allRatings } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', req.params.productId);

    const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (allRatings || []).forEach(r => { distMap[r.rating] = (distMap[r.rating] || 0) + 1; });
    const distribution = Object.entries(distMap)
      .map(([rating, count]) => ({ _id: Number(rating), count }))
      .sort((a, b) => b._id - a._id);

    res.json({
      success: true,
      data: reviews,
      distribution,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/v1/reviews/:productId
exports.createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    // Check duplicate
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.productId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        product_id: req.params.productId,
        rating, title, comment
      })
      .select('*, user:user_id(id, name, avatar)')
      .single();

    if (error) throw error;

    // Note: the DB trigger `trg_reviews_recalc` automatically updates
    // products.ratings_average and products.ratings_count after insert.

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const { data: review } = await supabase
      .from('reviews').select('id, user_id').eq('id', req.params.id).maybeSingle();

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await supabase.from('reviews').delete().eq('id', req.params.id);

    // Note: the DB trigger handles rating recalculation automatically.

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
