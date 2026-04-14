const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder,
  updateOrderStatus, getAllOrders
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
