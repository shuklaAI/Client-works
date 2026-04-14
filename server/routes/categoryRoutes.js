const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getCategories, getCategory, getCategoriesFlat, getCategoriesFlatAdmin,
  createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/admin/flat', protect, adminOnly, getCategoriesFlatAdmin);
router.get('/flat', getCategoriesFlat);
router.get('/:slug', getCategory);

router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
