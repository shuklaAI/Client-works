/**
 * Create coupons table directly via PostgreSQL connection
 */
require('dotenv').config();
const { Client } = require('pg');

// Supabase direct connection string
// Format: postgresql://postgres.[ref]:[password]@[host]:5432/postgres
const SUPABASE_URL = process.env.SUPABASE_URL;
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

// The connection string for Supabase Postgres
const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

// Alternative: use the direct password-based connection
// Try both the transaction and session pooler
const CONNECTION_STRINGS = [
  `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`,
];

const SQL = `
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

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow all for service role') THEN
    CREATE POLICY "Allow all for service role" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function run() {
  for (const connStr of CONNECTION_STRINGS) {
    const client = new Client({ 
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    
    try {
      console.log('🔌 Connecting to Supabase PostgreSQL...');
      await client.connect();
      console.log('✅ Connected!\n');
      
      console.log('🔧 Creating coupons table...');
      await client.query(SQL);
      console.log('✅ Table created!\n');
      
      // Seed data
      console.log('🎟️  Seeding coupons...');
      const coupons = [
        ['TECHBHARAT10', '10% off for everyone', 'percentage', 10, 0, 500, null, 0, true, null, '2026-12-31T23:59:59Z'],
        ['STUDENT15', '15% off for students', 'percentage', 15, 499, 1000, 500, 87, true, null, '2026-12-31T23:59:59Z'],
        ['WELCOME5', '5% welcome discount', 'percentage', 5, 0, 200, null, 0, true, null, null],
        ['FLAT200', 'Flat ₹200 off on orders above ₹1,999', 'fixed', 200, 1999, null, 100, 45, true, null, '2026-06-30T23:59:59Z'],
        ['MEGA30', '30% off Mega Sale (max ₹2000)', 'percentage', 30, 999, 2000, 200, 0, true, null, '2026-09-30T23:59:59Z'],
      ];

      for (const c of coupons) {
        try {
          await client.query(`
            INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_discount, usage_limit, used_count, is_active, starts_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()), $11::timestamptz)
            ON CONFLICT (code) DO UPDATE SET
              description = EXCLUDED.description,
              discount_type = EXCLUDED.discount_type,
              discount_value = EXCLUDED.discount_value,
              min_order = EXCLUDED.min_order,
              max_discount = EXCLUDED.max_discount
          `, c);
          console.log(`  ✅ ${c[0]} — ${c[1]}`);
        } catch (e) {
          console.log(`  ⚠️  ${c[0]} — ${e.message}`);
        }
      }
      
      // Verify
      const { rows } = await client.query('SELECT code, discount_type, discount_value FROM coupons ORDER BY created_at');
      console.log(`\n📋 Coupons in database: ${rows.length}`);
      rows.forEach(r => console.log(`   ${r.code} — ${r.discount_type === 'percentage' ? r.discount_value + '%' : '₹' + r.discount_value}`));
      
      await client.end();
      console.log('\n✨ All done! Coupons are ready.\n');
      process.exit(0);
      
    } catch (err) {
      try { await client.end(); } catch {}
      console.log(`⚠️  Connection failed: ${err.message}`);
      continue;
    }
  }
  
  console.log('\n❌ Could not connect to database. Please run the SQL manually:');
  console.log(`   Go to: https://app.supabase.com/project/${projectRef}/sql`);
  console.log('   And paste the contents of: server/db/coupons_migration.sql\n');
  process.exit(1);
}

run();
