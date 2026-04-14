const crypto = require('crypto');
const { supabase } = require('../config/db');

// Lazy-load Razorpay so server starts even without keys configured
let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

function genOrderNumber() {
  return `TB${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
}

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/razorpay/create-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { userId: req.user?.id || 'guest' }
    });

    res.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay payment & persist order
// @route   POST /api/v1/payments/razorpay/verify
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      shippingAddress, items, itemsPrice, taxPrice, shippingPrice, totalPrice
    } = req.body;

    // 1. Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. Possible fraud attempt.'
      });
    }

    // 2. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        order_number: genOrderNumber(),
        shipping_address: shippingAddress,
        payment_method: 'razorpay',
        payment_result: {
          id: razorpay_payment_id,
          status: 'paid',
          updateTime: new Date().toISOString(),
          emailAddress: req.user.email
        },
        items_price: itemsPrice,
        tax_price: taxPrice,
        shipping_price: shippingPrice,
        total_price: totalPrice,
        status: 'confirmed'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insert order items
    if (items && items.length > 0) {
      await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.product || i.product_id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity
        }))
      );
    }

    // 4. Decrement stock for each item
    for (const item of (items || [])) {
      const pid = item.product || item.product_id;
      if (pid) {
        const { data: p } = await supabase.from('products').select('stock').eq('id', pid).single();
        if (p) {
          await supabase.from('products')
            .update({ stock: Math.max(0, p.stock - item.quantity) })
            .eq('id', pid);
        }
      }
    }

    // 5. Clear server-side cart
    if (req.user) {
      await supabase.from('carts').delete().eq('user_id', req.user.id);
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      data: { orderNumber: order.order_number, orderId: order.id }
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    next(error);
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/v1/payments/razorpay/webhook
exports.razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } else {
    console.warn('RAZORPAY_WEBHOOK_SECRET not set, skipping signature verification');
  }

  const event   = req.body.event;
  const payload = req.body.payload;

  try {
    switch (event) {
      case 'payment.captured':
        console.log('✅ Payment captured:', payload.payment?.entity?.id);
        break;
      case 'payment.failed':
        console.log('❌ Payment failed:', payload.payment?.entity?.id);
        // Optionally mark order as failed in DB here
        break;
      case 'refund.processed':
        console.log('↩️  Refund processed:', payload.refund?.entity?.id);
        break;
      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
