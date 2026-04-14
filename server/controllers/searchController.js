const { supabase } = require('../config/db');

// @desc    Search products
// @route   GET /api/v1/search
exports.search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12, sort } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [], pagination: { total: 0 } });
    }

    const term = q.trim();

    // Sort mapping
    const sortMap = {
      price_asc:  { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      rating:     { column: 'ratings_average', ascending: false },
      newest:     { column: 'created_at', ascending: false }
    };
    const s = sortMap[sort] || { column: 'ratings_count', ascending: false };

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const from     = (pageNum - 1) * limitNum;

    // Use Postgres full-text search (ilike fallback for partial matches)
    const { data: products, count, error } = await supabase
      .from('products')
      .select('*, category:category_id(id, name, slug)', { count: 'exact' })
      .eq('is_active', true)
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`)
      .order(s.column, { ascending: s.ascending })
      .range(from, from + limitNum - 1);

    if (error) throw error;

    // Attach images
    const ids = (products || []).map(p => p.id);
    let imgMap = {};
    if (ids.length > 0) {
      const { data: images } = await supabase
        .from('product_images').select('*').in('product_id', ids).order('order');
      (images || []).forEach(img => {
        if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
        imgMap[img.product_id].push({ url: img.url, alt: img.alt });
      });
    }
    const withImages = (products || []).map(p => ({ ...p, images: imgMap[p.id] || [] }));

    res.json({
      success: true,
      data: withImages,
      query: q,
      pagination: {
        page: pageNum, limit: limitNum,
        total: count, pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/v1/search/suggestions
exports.suggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { products: [], categories: [] } });
    }

    const term = q.trim();

    const [{ data: productHits }, { data: categoryHits }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, price, category:category_id(name, slug)')
        .eq('is_active', true)
        .ilike('name', `%${term}%`)
        .limit(5),
      supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .ilike('name', `%${term}%`)
        .limit(3)
    ]);

    // Attach first image for each product suggestion
    const ids = (productHits || []).map(p => p.id);
    let firstImages = {};
    if (ids.length > 0) {
      const { data: images } = await supabase
        .from('product_images').select('product_id, url, alt').in('product_id', ids).order('order');
      (images || []).forEach(img => {
        if (!firstImages[img.product_id]) firstImages[img.product_id] = img;
      });
    }
    const products = (productHits || []).map(p => ({
      ...p,
      image: firstImages[p.id] || null
    }));

    res.json({ success: true, data: { products, categories: categoryHits || [] } });
  } catch (error) {
    next(error);
  }
};
