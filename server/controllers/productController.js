const slugify = require('slugify');
const { supabase } = require('../config/db');

// ─── Helper: attach images array to products ─────────────────────────────────
async function attachImages(products) {
  if (!products || products.length === 0) return products;
  const ids = products.map(p => p.id);
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', ids)
    .order('order');
  const imgMap = {};
  (images || []).forEach(img => {
    if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
    imgMap[img.product_id].push({ url: img.url, alt: img.alt });
  });
  return products.map(p => ({ ...p, images: imgMap[p.id] || [] }));
}

// ─── Helper: strip fields that don't exist in DB ─────────────────────────────
// Prevents "column X does not exist" errors when frontend sends extra fields
const ALLOWED_PRODUCT_FIELDS = new Set([
  'name', 'slug', 'description', 'rich_description', 'brand',
  'category_id', 'subcategory_id',
  'price', 'mrp', 'discount_percentage',
  'stock', 'sku', 'specifications', 'features', 'tags',
  'ratings_average', 'ratings_count',
  'is_featured', 'is_active',
  'weight', 'dimensions'
]);

function sanitizeProduct(obj) {
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (ALLOWED_PRODUCT_FIELDS.has(key)) {
      // Convert empty string FKs to null to avoid FK constraint errors
      if ((key === 'category_id' || key === 'subcategory_id') && obj[key] === '') {
        clean[key] = null;
      } else {
        clean[key] = obj[key];
      }
    }
  }
  return clean;
}

// ─── GET /api/v1/products  (public storefront) ───────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category, subcategory, brand, minPrice, maxPrice,
      minRating, search, sort, page = 1, limit = 12,
      featured, inStock
    } = req.query;

    let query = supabase
      .from('products')
      .select(`
        id, name, slug, price, mrp, discount_percentage, stock, sku, brand,
        ratings_average, ratings_count, is_featured, is_active, created_at,
        category:category_id(id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true);

    if (category) query = query.eq('category_id', category);
    if (subcategory) query = query.eq('subcategory_id', subcategory);
    if (brand) query = query.in('brand', brand.split(','));
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (minRating) query = query.gte('ratings_average', Number(minRating));
    if (featured === 'true') query = query.eq('is_featured', true);
    if (inStock === 'true') query = query.gt('stock', 0);
    // ✅ Use ilike — more reliable than textSearch, no special index needed
    if (search) query = query.ilike('name', `%${search}%`);

    const sortMap = {
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      rating: { column: 'ratings_average', ascending: false },
      popular: { column: 'ratings_count', ascending: false },
      name_asc: { column: 'name', ascending: true },
      newest: { column: 'created_at', ascending: false },
    };
    const s = sortMap[sort] || { column: 'created_at', ascending: false };
    query = query.order(s.column, { ascending: s.ascending });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.range(from, from + limitNum - 1);

    const { data: products, count, error } = await query;
    if (error) throw error;

    const withImages = await attachImages(products || []);

    const { data: brandsRaw } = await supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null);
    const brands = [...new Set((brandsRaw || []).map(b => b.brand))].filter(Boolean).sort();

    res.json({
      success: true,
      data: withImages,
      pagination: {
        page: pageNum, limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      },
      filters: { brands }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/admin/products  (admin — ALL products) ──────────────────────
exports.getAdminProducts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    let query = supabase
      .from('products')
      .select(`
        id, name, slug, price, mrp, stock, sku, brand,
        ratings_average, ratings_count, is_featured, is_active, created_at,
        category:category_id(id, name, slug)
      `, { count: 'exact' });
    // ✅ No is_active filter — admin sees everything

    if (search) query = query.ilike('name', `%${search}%`);

    query = query.order('created_at', { ascending: false });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.range(from, from + limitNum - 1);

    const { data: products, count, error } = await query;
    if (error) throw error;

    const withImages = await attachImages(products || []);

    res.json({
      success: true,
      data: withImages,
      pagination: {
        page: pageNum, limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/products/:slug  (single product) ────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    // ✅ FIX: removed subcategory join (FK not cached in Supabase)
    const { data: product, error } = await supabase
      .from('products')
      .select(`*, category:category_id(id, name, slug)`)
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { data: images } = await supabase
      .from('product_images')
      .select('url, alt')
      .eq('product_id', product.id)
      .order('order');
    product.images = images || [];

    const { data: relatedRaw } = await supabase
      .from('products')
      .select('id, name, slug, price, mrp, ratings_average, ratings_count')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(8);

    const related = await attachImages(relatedRaw || []);
    res.json({ success: true, data: product, related });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/products/featured ───────────────────────────────────────────
exports.getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, price, mrp, stock, sku, brand, ratings_average, ratings_count, is_featured, created_at, category:category_id(id, name, slug)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data: await attachImages(products || []) });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/products/new-arrivals ───────────────────────────────────────
exports.getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, price, mrp, stock, sku, brand, ratings_average, ratings_count, is_featured, created_at, category:category_id(id, name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data: await attachImages(products || []) });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/products/bestsellers ────────────────────────────────────────
exports.getBestsellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, price, mrp, stock, sku, brand, ratings_average, ratings_count, is_featured, created_at, category:category_id(id, name, slug)')
      .eq('is_active', true)
      .gt('ratings_count', 0)
      .order('ratings_average', { ascending: false })
      .order('ratings_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data: await attachImages(products || []) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/products  (admin create) ───────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const { images, ...rawRest } = req.body;
    // ✅ FIX: sanitize — only send known columns, null-ify empty FKs
    const rest = sanitizeProduct(rawRest);
    rest.slug = slugify(rest.name, { lower: true, strict: true });
    if (!rest.description) rest.description = rest.name;

    const { data: product, error } = await supabase
      .from('products')
      .insert(rest)
      .select()
      .single();
    if (error) throw error;

    if (images && images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((img, i) => ({
          product_id: product.id,
          url: img.url,
          alt: img.alt || product.name,
          order: i
        }))
      );
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/products/:id  (admin update) ────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const { images, ...rawRest } = req.body;
    // ✅ FIX: sanitize — strip unknown columns, null-ify empty FKs
    const rest = sanitizeProduct(rawRest);
    if (rest.name) rest.slug = slugify(rest.name, { lower: true, strict: true });

    const { data: product, error } = await supabase
      .from('products')
      .update(rest)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // ✅ FIX: Update images — delete old ones, insert new ones
    if (Array.isArray(images)) {
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', req.params.id);

      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((img, i) => ({
            product_id: req.params.id,
            url: img.url,
            alt: img.alt || product.name,
            order: i
          }))
        );
      }
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/products/:id  (admin delete) ─────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};