const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getReviews, createReview, deleteReview
} = require('../controllers/reviewController');

router.get('/:productId', getReviews);
router.post('/:productId', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
