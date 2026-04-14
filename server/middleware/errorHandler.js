const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Error:', err.message);

  // ─── Supabase / PostgreSQL errors ───
  // Unique constraint violation (e.g. duplicate slug, SKU, email)
  if (err.code === '23505') {
    const detail = err.details || err.message || '';
    const match = detail.match(/Key \((\w+)\)/);
    const field = match ? match[1] : 'field';
    error.message = `Duplicate value for ${field}. Please use another value.`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Foreign key violation (e.g. invalid category_id)
  if (err.code === '23503') {
    error.message = 'Referenced record not found. Please check your selections.';
    return res.status(400).json({ success: false, message: error.message });
  }

  // Not-null violation
  if (err.code === '23502') {
    const col = err.column || 'field';
    error.message = `Missing required field: ${col}`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Check constraint violation
  if (err.code === '23514') {
    error.message = 'Value does not meet the required constraints.';
    return res.status(400).json({ success: false, message: error.message });
  }

  // Undefined table
  if (err.code === '42P01') {
    error.message = 'Database table not found. Please run migrations.';
    return res.status(500).json({ success: false, message: error.message });
  }

  // Supabase PGRST errors (PostgREST)
  if (err.code === 'PGRST116') {
    error.message = 'Resource not found.';
    return res.status(404).json({ success: false, message: error.message });
  }

  // ─── Legacy Mongoose errors (kept for safety) ───
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({ success: false, message: error.message });
  }

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    error.message = `Duplicate value for ${field}. Please use another value.`;
    return res.status(400).json({ success: false, message: error.message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(val => val.message);
    error.message = messages.join('. ');
    return res.status(400).json({ success: false, message: error.message });
  }

  // ─── JWT errors ───
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
