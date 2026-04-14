const { supabase } = require('../config/db');

function genOrderNumber() {
  return `TB${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
}

// @desc    Create order from cart
// @route   POST /api/v1/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get cart
    const { data: cart } = await supabase
      .from('carts').select('id').eq('user_id', req.user.id).maybeSingle();

    if (!cart) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('quantity, product:product_id(id, name, price, stock, images:product_images(url, alt))')
      .eq('cart_id', cart.id);

    if (!cartItems || cartItems.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cartItems) {
      const product = item.product;
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product?.name || 'A product'} is out of stock or has insufficient quantity`
        });
      }
      orderItems.push({
        product_id: product.id, name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price, quantity: item.quantity
      });
      itemsPrice += product.price * item.quantity;
    }

    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
    const shippingPrice = itemsPrice >= 999 ? 0 : 99;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        order_number: genOrderNumber(),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items_price: itemsPrice, tax_price: taxPrice,
        shipping_price: shippingPrice, total_price: totalPrice,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending'
      }).select().single();

    if (error) throw error;

    // Insert order items
    await supabase.from('order_items').insert(
      orderItems.map(i => ({ ...i, order_id: order.id }))
    );

    // Decrement stock
    for (const item of cartItems) {
      await supabase.from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product.id);
    }

    // Clear cart
    await supabase.from('carts').delete().eq('id', cart.id);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/v1/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;

    const { data: orders, count, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    res.json({
      success: true, data: orders,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, user:user_id(name, email), items:order_items(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const { data: existing } = await supabase.from('orders').select('*, items:order_items(product_id, quantity)').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Order not found' });

    const updates = { status };
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      for (const item of existing.items) {
        const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
        if (p) await supabase.from('products').update({ stock: p.stock + item.quantity }).eq('id', item.product_id);
      }
    }

    const { data: order, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from = (page - 1) * limit;
    const { status } = req.query;

    let query = supabase
      .from('orders')
      .select('*, user:user_id(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    // Stats per status
    const { data: statsRaw } = await supabase
      .from('orders')
      .select('status, total_price');

    const statsMap = {};
    (statsRaw || []).forEach(o => {
      if (!statsMap[o.status]) statsMap[o.status] = { count: 0, revenue: 0 };
      statsMap[o.status].count++;
      statsMap[o.status].revenue += Number(o.total_price);
    });
    const stats = Object.entries(statsMap).map(([_id, v]) => ({ _id, ...v }));

    res.json({
      success: true, data: orders, stats,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};
