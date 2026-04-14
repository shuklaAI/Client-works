const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

const {
  getStats, getRevenueChart, getUsers, getUser, updateUserRole,
  getLowStock, getActivity, getPayments, getTopProducts
} = require('../controllers/adminController');

const {
  getCoupons, createCoupon, updateCoupon,
  deleteCoupon, toggleCoupon, updateSalePrices
} = require('../controllers/couponController');

// ✅ FIX: Import getAdminProducts — this was missing and caused server crash
const { getAdminProducts } = require('../controllers/productController');

// All admin routes require auth
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/activity', getActivity);
router.get('/top-products', getTopProducts);
router.get('/payments', getPayments);
router.get('/low-stock', getLowStock);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);

// ✅ Products (admin view — all products, active + inactive)
// NOTE: This must be BEFORE /products/sale to avoid route conflict
router.get('/products', getAdminProducts);
router.put('/products/sale', updateSalePrices);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.patch('/coupons/:id/toggle', toggleCoupon);

module.exports = router;