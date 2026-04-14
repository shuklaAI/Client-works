require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes      = require('./routes/authRoutes');
const productRoutes   = require('./routes/productRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const cartRoutes      = require('./routes/cartRoutes');
const orderRoutes     = require('./routes/orderRoutes');
const searchRoutes    = require('./routes/searchRoutes');
const reviewRoutes    = require('./routes/reviewRoutes');
const paymentRoutes   = require('./routes/paymentRoutes'); // ← NEW
const adminRoutes     = require('./routes/adminRoutes');   // ← ADMIN

const app = express();

// ─── Database ─────────────────────────────────────────────
connectDB();

// ─── Security middleware ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// ─── Rate limiting ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // strict for auth
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' }
});
app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ─── Body parsers ───────────────────────────────────────────
// NOTE: Razorpay webhook needs raw body — must be registered before express.json
app.use('/api/v1/payments/razorpay/webhook',
  express.raw({ type: 'application/json' })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/products',   productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart',       cartRoutes);
app.use('/api/v1/orders',     orderRoutes);
app.use('/api/v1/search',     searchRoutes);
app.use('/api/v1/reviews',    reviewRoutes);
app.use('/api/v1/payments',   paymentRoutes); // ← NEW
app.use('/api/v1/admin',      adminRoutes);   // ← ADMIN

// Public coupon validation (requires login but not admin)
const { protect } = require('./middleware/auth');
const { validateCoupon } = require('./controllers/couponController');
app.post('/api/v1/coupons/validate', protect, validateCoupon);

// ─── Health check ───────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    razorpay: !!process.env.RAZORPAY_KEY_ID
  });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TechBharat Store API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '⚠️  NOT configured (add RAZORPAY_KEY_ID)'}`);
});
