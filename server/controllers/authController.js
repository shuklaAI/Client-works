const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email: email.toLowerCase(), password_hash, phone })
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    const token = generateToken(user.id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, phone, password_hash')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const { data: addresses } = await supabase
      .from('user_addresses').select('*').eq('user_id', user.id);

    const token = generateToken(user.id);
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: { ...safeUser, addresses: addresses || [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, phone, created_at')
      .eq('id', req.user.id)
      .single();

    const { data: addresses } = await supabase
      .from('user_addresses').select('*').eq('user_id', req.user.id);

    res.json({ success: true, user: { ...user, addresses: addresses || [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/v1/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const { data: user, error } = await supabase
      .from('users').update({ name, phone })
      .eq('id', req.user.id)
      .select('id, name, email, role, phone').single();
    if (error) throw error;
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user } = await supabase
      .from('users').select('id, password_hash').eq('id', req.user.id).single();

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password_hash }).eq('id', req.user.id);

    res.json({ success: true, token: generateToken(user.id), message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/v1/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, country = 'India', is_default = false } = req.body;

    if (is_default) {
      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', req.user.id);
    }

    const { error } = await supabase.from('user_addresses').insert({
      user_id: req.user.id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default
    });
    if (error) throw error;

    const { data: addresses } = await supabase.from('user_addresses').select('*').eq('user_id', req.user.id);
    res.status(201).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/v1/auth/addresses/:addressId
exports.deleteAddress = async (req, res, next) => {
  try {
    await supabase.from('user_addresses')
      .delete().eq('id', req.params.addressId).eq('user_id', req.user.id);

    const { data: addresses } = await supabase.from('user_addresses').select('*').eq('user_id', req.user.id);
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};
