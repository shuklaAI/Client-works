/**
 * Seed initial coupons for TechBharat Store
 * Usage: node server/db/seedCoupons.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { supabase } = require('../config/db');

const COUPONS = [
  {
    code: 'TECHBHARAT10',
    description: '10% off for everyone',
    discount_type: 'percentage',
    discount_value: 10,
    min_order: 0,
    max_discount: 500,
    usage_limit: null,
    is_active: true,
    expires_at: '2026-12-31T23:59:59Z',
  },
  {
    code: 'STUDENT15',
    description: '15% off for students',
    discount_type: 'percentage',
    discount_value: 15,
    min_order: 499,
    max_discount: 1000,
    usage_limit: 500,
    is_active: true,
    expires_at: '2026-12-31T23:59:59Z',
  },
  {
    code: 'WELCOME5',
    description: '5% welcome discount for new users',
    discount_type: 'percentage',
    discount_value: 5,
    min_order: 0,
    max_discount: 200,
    usage_limit: null,
    is_active: true,
    expires_at: null,
  },
  {
    code: 'FLAT200',
    description: 'Flat ₹200 off on orders above ₹1,999',
    discount_type: 'fixed',
    discount_value: 200,
    min_order: 1999,
    max_discount: null,
    usage_limit: 100,
    is_active: true,
    expires_at: '2026-06-30T23:59:59Z',
  },
  {
    code: 'MEGA30',
    description: '30% off - Mega Sale (max ₹2000 discount)',
    discount_type: 'percentage',
    discount_value: 30,
    min_order: 999,
    max_discount: 2000,
    usage_limit: 200,
    is_active: true,
    expires_at: '2026-09-30T23:59:59Z',
  },
];

async function seedCoupons() {
  console.log('🎟️  Seeding coupons...\n');

  // First check if table exists — create if not
  const { error: tableCheck } = await supabase.from('coupons').select('id').limit(1);
  
  if (tableCheck && tableCheck.message?.includes('does not exist')) {
    console.log('⚠️  Coupons table does not exist! Creating it...\n');
    
    // Create the table via raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS coupons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL UNIQUE,
          description TEXT,
          discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
          discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
          min_order NUMERIC(10,2) DEFAULT 0,
          max_discount NUMERIC(10,2),
          usage_limit INTEGER DEFAULT NULL,
          used_count INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          starts_at TIMESTAMPTZ DEFAULT now(),
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    });
    
    if (createError) {
      console.log('⚠️  Could not auto-create table. Please run the SQL migration first:');
      console.log('   📄 server/db/coupons_migration.sql\n');
      console.log('   Paste the contents into your Supabase SQL Editor and run it.\n');
      process.exit(1);
    }
  }

  let created = 0;
  let skipped = 0;

  for (const coupon of COUPONS) {
    const { data, error } = await supabase
      .from('coupons')
      .upsert(coupon, { onConflict: 'code' })
      .select()
      .single();

    if (error) {
      console.log(`  ⚠️  ${coupon.code} — ${error.message}`);
      skipped++;
    } else {
      console.log(`  ✅ ${coupon.code} — ${coupon.description}`);
      created++;
    }
  }

  console.log(`\n┌─────────────────────────────────────┐`);
  console.log(`│   🎟️  Coupons Seeded Successfully    │`);
  console.log(`├─────────────────────────────────────┤`);
  console.log(`│  Created/Updated: ${created}                │`);
  console.log(`│  Skipped:         ${skipped}                │`);
  console.log(`└─────────────────────────────────────┘`);
  console.log(`\n💡 Manage coupons at: http://localhost:3000/admin/discounts\n`);

  process.exit(0);
}

seedCoupons();
