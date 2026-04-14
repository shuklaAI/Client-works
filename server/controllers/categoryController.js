const slugify = require('slugify');
const { supabase } = require('../config/db');

// Helper: recursively attach children to categories
function buildTree(all, parentId = null) {
  return all
    .filter(c => c.parent_id === parentId)
    .sort((a, b) => a.order - b.order)
    .map(c => ({ ...c, children: buildTree(all, c.id) }));
}

// @desc    Get all categories (nested tree)
// @route   GET /api/v1/categories
exports.getCategories = async (req, res, next) => {
  try {
    const { data: all, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order');
    if (error) throw error;

    const tree = buildTree(all, null);
    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category with children + ancestors
// @route   GET /api/v1/categories/:slug
exports.getCategory = async (req, res, next) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single();

    if (error || !category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Direct children
    const { data: children } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('order');

    // Walk up to build ancestors for breadcrumbs
    const ancestors = [];
    let currentParentId = category.parent_id;
    while (currentParentId) {
      const { data: parent } = await supabase
        .from('categories')
        .select('*')
        .eq('id', currentParentId)
        .single();
      if (!parent) break;
      ancestors.unshift(parent);
      currentParentId = parent.parent_id;
    }

    res.json({ success: true, data: { ...category, children: children || [], ancestors } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flat list of all active categories
// @route   GET /api/v1/categories/flat
exports.getCategoriesFlat = async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('order');
    if (error) throw error;
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flat list of ALL categories (admin — includes inactive)
// @route   GET /api/v1/categories/admin/flat
exports.getCategoriesFlatAdmin = async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('level')
      .order('order');
    if (error) throw error;
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (admin)
// @route   POST /api/v1/categories
exports.createCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.slug = slugify(payload.name, { lower: true, strict: true });

    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('categories').select('level').eq('id', payload.parent_id).single();
      if (parent) payload.level = parent.level + 1;
    }

    const { data: category, error } = await supabase
      .from('categories').insert(payload).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/v1/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.name) payload.slug = slugify(payload.name, { lower: true, strict: true });

    const { data: category, error } = await supabase
      .from('categories').update(payload).eq('id', req.params.id).select().single();
    if (error || !category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/v1/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const { count } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', req.params.id);

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Remove subcategories first.'
      });
    }

    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
