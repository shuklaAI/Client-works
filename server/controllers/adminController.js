const { supabase } = require('../config/db');

// @desc    Dashboard stats (KPIs)
// @route   GET /api/v1/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_price')
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);
    const totalRevenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total_price), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: ordersToday } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    // ✅ FIX: Don't filter by is_active — count all products safely
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // ✅ FIX: Don't filter by is_active for low stock count
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lt('stock', 10);

    res.json({
      success: true,
      data: {
        totalRevenue,
        ordersToday: ordersToday || 0,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        pendingOrders: pendingOrders || 0,
        lowStockCount: lowStockCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revenue chart data
// @route   GET /api/v1/admin/revenue-chart?days=30
exports.getRevenueChart = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_price, created_at')
      .gte('created_at', since.toISOString())
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
      .order('created_at', { ascending: true });

    const grouped = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      grouped[key] = { date: key, revenue: 0, orders: 0 };
    }

    (orders || []).forEach(o => {
      const key = new Date(o.created_at).toISOString().split('T')[0];
      if (grouped[key]) {
        grouped[key].revenue += Number(o.total_price);
        grouped[key].orders += 1;
      }
    });

    res.json({ success: true, data: Object.values(grouped) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/v1/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from = (page - 1) * limit;
    const { search } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, is_verified, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query;
    if (error) throw error;

    const userIds = (users || []).map(u => u.id);
    const { data: orderStats } = await supabase
      .from('orders')
      .select('user_id, total_price')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

    const statsMap = {};
    (orderStats || []).forEach(o => {
      if (!statsMap[o.user_id]) statsMap[o.user_id] = { totalOrders: 0, totalSpent: 0 };
      statsMap[o.user_id].totalOrders++;
      statsMap[o.user_id].totalSpent += Number(o.total_price);
    });

    const usersWithStats = (users || []).map(u => ({
      ...u,
      totalOrders: statsMap[u.id]?.totalOrders || 0,
      totalSpent: statsMap[u.id]?.totalSpent || 0
    }));

    res.json({
      success: true,
      data: usersWithStats,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with purchase history
// @route   GET /api/v1/admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, is_verified, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !user) return res.status(404).json({ success: false, message: 'User not found' });

    const { data: orders } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: addresses } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id);

    res.json({ success: true, data: { ...user, orders: orders || [], addresses: addresses || [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Low stock products
// @route   GET /api/v1/admin/low-stock
exports.getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    // ✅ FIX: Removed is_active filter — column may not exist in DB yet
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, sku, stock, price, brand, category:category_id(name)')
      .lt('stock', threshold)
      .order('stock', { ascending: true })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, data: products || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Recent activity feed
// @route   GET /api/v1/admin/activity
exports.getActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, total_price, status, created_at, user:user_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('id, rating, title, created_at, user:user_id(name), product:product_id(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const feed = [];

    (recentOrders || []).forEach(o => {
      feed.push({
        type: 'order',
        id: o.id,
        message: `New order #${o.order_number} — ₹${Number(o.total_price).toLocaleString('en-IN')}`,
        detail: o.user?.name || o.user?.email || 'Customer',
        status: o.status,
        timestamp: o.created_at
      });
    });

    (recentReviews || []).forEach(r => {
      feed.push({
        type: 'review',
        id: r.id,
        message: `${r.user?.name || 'User'} reviewed "${r.product?.name || 'product'}"`,
        detail: `${r.rating}★ — ${r.title || ''}`,
        timestamp: r.created_at
      });
    });

    (recentUsers || []).forEach(u => {
      feed.push({
        type: 'user',
        id: u.id,
        message: `${u.name} joined TechBharat`,
        detail: u.email,
        timestamp: u.created_at
      });
    });

    feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: feed.slice(0, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments/order financials
// @route   GET /api/v1/admin/payments
exports.getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from = (page - 1) * limit;

    const { data: orders, count, error } = await supabase
      .from('orders')
      .select('id, order_number, payment_method, payment_result, items_price, tax_price, shipping_price, total_price, status, created_at, user:user_id(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: orders || [],
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/v1/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "admin" or "user".' });
    }

    // Prevent admin from demoting themselves
    if (req.user.id === req.params.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, name, email, role')
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user, message: `User role updated to "${role}"` });
  } catch (error) {
    next(error);
  }
};

// @desc    Top selling products
// @route   GET /api/v1/admin/top-products
exports.getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, name, price, quantity');

    const map = {};
    (items || []).forEach(i => {
      if (!map[i.product_id]) map[i.product_id] = { product_id: i.product_id, name: i.name, price: i.price, totalQty: 0, totalRevenue: 0 };
      map[i.product_id].totalQty += i.quantity;
      map[i.product_id].totalRevenue += i.quantity * Number(i.price);
    });

    const sorted = Object.values(map)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    res.json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};