const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook
} = require('../controllers/paymentController');

// Webhook must use raw body - mount BEFORE express.json() in server.js
// (We handle it by using express.raw here for this route)
router.post(
  '/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

// Protected routes (user must be logged in to pay)
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
