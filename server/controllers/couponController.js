const { supabase } = require('../config/db');

// @desc    Get all coupons
// @route   GET /api/v1/admin/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: coupons || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon
// @route   POST /api/v1/admin/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, description, discount_type, discount_value, min_order, max_discount, usage_limit, is_active, starts_at, expires_at } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase().trim(),
        description: description || '',
        discount_type: discount_type || 'percentage',
        discount_value: Number(discount_value),
        min_order: Number(min_order) || 0,
        max_discount: max_discount ? Number(max_discount) : null,
        usage_limit: usage_limit ? Number(usage_limit) : null,
        is_active: is_active !== false,
        starts_at: starts_at || new Date().toISOString(),
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/admin/coupons/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.code) updates.code = updates.code.toUpperCase().trim();
    if (updates.discount_value) updates.discount_value = Number(updates.discount_value);
    if (updates.min_order !== undefined) updates.min_order = Number(updates.min_order);
    if (updates.max_discount !== undefined) updates.max_discount = updates.max_discount ? Number(updates.max_discount) : null;
    if (updates.usage_limit !== undefined) updates.usage_limit = updates.usage_limit ? Number(updates.usage_limit) : null;

    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/admin/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon active state
// @route   PATCH /api/v1/admin/coupons/:id/toggle
exports.toggleCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: coupon } = await supabase
      .from('coupons')
      .select('is_active')
      .eq('id', id)
      .single();

    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon (public — for cart use)
// @route   POST /api/v1/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Check start date
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    // Check minimum order
    const orderAmount = Number(subtotal) || 0;
    if (coupon.min_order && orderAmount < coupon.min_order) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.min_order.toLocaleString('en-IN')} required for this coupon`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round(orderAmount * coupon.discount_value / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
        description: coupon.description,
        min_order: coupon.min_order,
        max_discount: coupon.max_discount,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update product sale prices
// @route   PUT /api/v1/admin/products/sale
exports.updateSalePrices = async (req, res, next) => {
  try {
    const { products } = req.body; // [{ id, price, mrp }]

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: 'Products array required' });
    }

    const results = [];
    for (const p of products) {
      const { data, error } = await supabase
        .from('products')
        .update({ price: Number(p.price), updated_at: new Date().toISOString() })
        .eq('id', p.id)
        .select('id, name, price, mrp')
        .single();

      if (!error && data) results.push(data);
    }

    res.json({ success: true, data: results, message: `${results.length} products updated` });
  } catch (error) {
    next(error);
  }
};
