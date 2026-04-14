/**
 * Seed Admin User for TechBharat Store
 * Run: node db/seedAdmin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

const ADMIN_EMAIL    = 'admin@techbharat.in';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME     = 'TechBharat Admin';
const ADMIN_PHONE    = '+91 98765 43210';

async function seedAdmin() {
  console.log('🔧 Seeding admin user...\n');

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  if (existing) {
    if (existing.role === 'admin') {
      console.log('✅ Admin user already exists and has admin role.');
    } else {
      // Promote to admin
      await supabase.from('users').update({ role: 'admin' }).eq('id', existing.id);
      console.log('✅ Existing user promoted to admin.');
    }
    console.log(`\n📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`\n🌐 Login at: http://localhost:3000/login`);
    console.log(`📊 Admin at: http://localhost:3000/admin`);
    return;
  }

  // Create new admin user
  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password_hash,
      phone: ADMIN_PHONE,
      role: 'admin',
      is_verified: true
    })
    .select('id, name, email, role')
    .single();

  if (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!\n');
  console.log('┌─────────────────────────────────────┐');
  console.log('│   TechBharat Admin Credentials      │');
  console.log('├─────────────────────────────────────┤');
  console.log(`│  📧 Email:    ${ADMIN_EMAIL}   │`);
  console.log(`│  🔑 Password: ${ADMIN_PASSWORD}              │`);
  console.log(`│  👤 Name:     ${ADMIN_NAME}      │`);
  console.log('└─────────────────────────────────────┘');
  console.log(`\n🌐 Login at: http://localhost:3000/login`);
  console.log(`📊 Admin at: http://localhost:3000/admin`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
