const { supabase } = require('../config/db');

async function getPopulatedCart(cartId) {
  const { data: items } = await supabase
    .from('cart_items')
    .select('id, quantity, product:product_id(id, name, slug, price, mrp, stock, brand, images:product_images(url, alt, order))')
    .eq('cart_id', cartId);

  let subtotal = 0, itemCount = 0;
  const enrichedItems = (items || []).map(item => {
    const p = item.product;
    const lineTotal = (p?.price || 0) * item.quantity;
    subtotal += lineTotal;
    itemCount += item.quantity;
    const images = [...(p?.images || [])].sort((a, b) => a.order - b.order);
    return { _id: item.id, product: { ...p, images }, quantity: item.quantity, lineTotal };
  });
  return { items: enrichedItems, subtotal, itemCount };
}

// @desc    Get cart
// @route   GET /api/v1/cart
exports.getCart = async (req, res, next) => {
  try {
    let cartQuery = supabase.from('carts').select('id');
    if (req.user) {
      cartQuery = cartQuery.eq('user_id', req.user.id);
    } else if (req.query.sessionId) {
      cartQuery = cartQuery.eq('session_id', req.query.sessionId);
    } else {
      return res.json({ success: true, data: { items: [], subtotal: 0, itemCount: 0 } });
    }

    const { data: cart } = await cartQuery.maybeSingle();
    if (!cart) return res.json({ success: true, data: { items: [], subtotal: 0, itemCount: 0 } });

    res.json({ success: true, data: await getPopulatedCart(cart.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, sessionId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });

    const { data: product } = await supabase
      .from('products').select('id, stock, is_active').eq('id', productId).maybeSingle();

    if (!product || !product.is_active)
      return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < 1)
      return res.status(400).json({ success: false, message: 'Product is out of stock' });

    const cartFilter = req.user ? { user_id: req.user.id } : { session_id: sessionId };
    if (!req.user && !sessionId)
      return res.status(400).json({ success: false, message: 'Session ID required for guest cart' });

    let { data: cart } = await supabase.from('carts').select('id').match(cartFilter).maybeSingle();

    if (!cart) {
      const { data: newCart } = await supabase.from('carts').insert(cartFilter).select().single();
      cart = newCart;
    }

    // Upsert cart item
    const { data: existing } = await supabase
      .from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', productId).maybeSingle();

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity: Math.min(quantity, product.stock) });
    }

    res.json({ success: true, message: 'Item added to cart', data: await getPopulatedCart(cart.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity, sessionId } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    const cartFilter = req.user ? { user_id: req.user.id } : { session_id: sessionId };
    const { data: cart } = await supabase.from('carts').select('id').match(cartFilter).maybeSingle();
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const { data: item } = await supabase
      .from('cart_items').select('id, product_id').eq('id', req.params.itemId).eq('cart_id', cart.id).maybeSingle();
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
    await supabase.from('cart_items').update({ quantity: Math.min(quantity, product.stock) }).eq('id', item.id);

    res.json({ success: true, data: await getPopulatedCart(cart.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId;
    const cartFilter = req.user ? { user_id: req.user.id } : { session_id: sessionId };
    const { data: cart } = await supabase.from('carts').select('id').match(cartFilter).maybeSingle();
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    await supabase.from('cart_items').delete().eq('id', req.params.itemId).eq('cart_id', cart.id);

    res.json({ success: true, message: 'Item removed', data: await getPopulatedCart(cart.id) });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/v1/cart
exports.clearCart = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId;
    const cartFilter = req.user ? { user_id: req.user.id } : { session_id: sessionId };
    await supabase.from('carts').delete().match(cartFilter);
    res.json({ success: true, message: 'Cart cleared', data: { items: [], subtotal: 0, itemCount: 0 } });
  } catch (error) {
    next(error);
  }
};
