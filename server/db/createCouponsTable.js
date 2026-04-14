/**
 * Create the coupons table in Supabase and seed initial data
 * Run: node server/db/createCouponsTable.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
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

-- Enable RLS but allow service role full access
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy: allow all for service role (used by our backend)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
`;

async function createTable() {
  console.log('🔧 Creating coupons table via Supabase SQL API...\n');

  try {
    // Use Supabase SQL endpoint (available via service role)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: CREATE_TABLE_SQL }),
    });

    // If RPC doesn't work, try direct approach
    if (!res.ok) {
      console.log('⚠️  RPC not available, using direct SQL via management API...');
      
      // Alternative: Use the Supabase management API
      const sqlRes = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql: CREATE_TABLE_SQL }),
      });

      if (!sqlRes.ok) {
        console.log('\n⚠️  Automatic table creation not available.');
        console.log('📋 Please run this SQL manually in your Supabase Dashboard:\n');
        console.log('   1. Go to: https://app.supabase.com/project/' + projectRef + '/sql');
        console.log('   2. Paste and run the following SQL:\n');
        console.log('─'.repeat(60));
        console.log(CREATE_TABLE_SQL);
        console.log('─'.repeat(60));
        console.log('\n   3. Then run: node server/db/createCouponsTable.js seed\n');
        
        // If the user passed "seed" argument, skip table creation
        if (process.argv.includes('seed')) {
          return seedCoupons();
        }
        return;
      }
    }

    console.log('✅ Coupons table created successfully!\n');
  } catch (err) {
    console.log('\n⚠️  Could not auto-create table. Please run the SQL manually.');
    console.log('📋 Go to: https://app.supabase.com/project/' + projectRef + '/sql');
    console.log('\nPaste and run this SQL:\n');
    console.log(CREATE_TABLE_SQL);
  }

  // Now seed
  await seedCoupons();
}

async function seedCoupons() {
  console.log('🎟️  Seeding coupons...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const COUPONS = [
    { code: 'TECHBHARAT10', description: '10% off for everyone', discount_type: 'percentage', discount_value: 10, min_order: 0, max_discount: 500, is_active: true, expires_at: '2026-12-31T23:59:59Z' },
    { code: 'STUDENT15', description: '15% off for students', discount_type: 'percentage', discount_value: 15, min_order: 499, max_discount: 1000, usage_limit: 500, used_count: 87, is_active: true, expires_at: '2026-12-31T23:59:59Z' },
    { code: 'WELCOME5', description: '5% welcome discount', discount_type: 'percentage', discount_value: 5, min_order: 0, max_discount: 200, is_active: true },
    { code: 'FLAT200', description: 'Flat ₹200 off on orders above ₹1,999', discount_type: 'fixed', discount_value: 200, min_order: 1999, usage_limit: 100, used_count: 45, is_active: true, expires_at: '2026-06-30T23:59:59Z' },
    { code: 'MEGA30', description: '30% off Mega Sale (max ₹2000)', discount_type: 'percentage', discount_value: 30, min_order: 999, max_discount: 2000, usage_limit: 200, is_active: true, expires_at: '2026-09-30T23:59:59Z' },
  ];

  for (const coupon of COUPONS) {
    const { data, error } = await supabase
      .from('coupons')
      .upsert(coupon, { onConflict: 'code' })
      .select()
      .single();

    if (error) {
      console.log(`  ❌ ${coupon.code} — ${error.message}`);
    } else {
      console.log(`  ✅ ${coupon.code} — ${coupon.description}`);
    }
  }

  console.log('\n✨ Done! Visit: http://localhost:3000/admin/discounts\n');
}

createTable();
