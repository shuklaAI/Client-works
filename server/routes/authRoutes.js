const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, getMe, updateProfile,
  updatePassword, addAddress, deleteAddress
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
