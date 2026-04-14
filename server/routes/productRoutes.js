const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getProducts, getProduct, getFeatured, getNewArrivals,
  getBestsellers, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/bestsellers', getBestsellers);
router.get('/:slug', getProduct);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
