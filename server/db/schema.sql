-- ============================================================
-- TechBharat Store — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to set up all tables.
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL CHECK (char_length(name) <= 50),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar        TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  reset_password_token  TEXT,
  reset_password_expiry TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── USER ADDRESSES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'India',
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- ─── CATEGORIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(name) <= 100),
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image       TEXT,
  icon        TEXT,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  level       INT NOT NULL DEFAULT 0,
  "order"     INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active    ON categories(is_active, "order");

-- ─── PRODUCTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL CHECK (char_length(name) <= 200),
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT NOT NULL,
  rich_description    TEXT,
  brand               TEXT,
  category_id         UUID NOT NULL REFERENCES categories(id),
  subcategory_id      UUID REFERENCES categories(id),
  price               NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  mrp                 NUMERIC(10,2) CHECK (mrp >= 0),
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  stock               INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku                 TEXT NOT NULL UNIQUE,
  specifications      JSONB NOT NULL DEFAULT '{}',
  features            TEXT[] NOT NULL DEFAULT '{}',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  ratings_average     NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (ratings_average BETWEEN 0 AND 5),
  ratings_count       INT NOT NULL DEFAULT 0,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  weight              NUMERIC(10,3),
  dimensions          JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created     ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search      ON products USING GIN (
  to_tsvector('english', name || ' ' || description || ' ' || coalesce(brand,'') || ' ' || array_to_string(tags,' '))
);

-- ─── PRODUCT IMAGES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  "order"    INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ─── CARTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id    ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);

-- ─── CART ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ─── ORDERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  order_number     TEXT NOT NULL UNIQUE,
  shipping_address JSONB NOT NULL,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('razorpay','cod','stripe')),
  payment_result   JSONB,
  items_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  tracking_number  TEXT,
  notes            TEXT,
  delivered_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);

-- ─── ORDER ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  image      TEXT,
  price      NUMERIC(10,2) NOT NULL,
  quantity   INT NOT NULL CHECK (quantity >= 1)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── REVIEWS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating              INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title               TEXT CHECK (char_length(title) <= 100),
  comment             TEXT NOT NULL CHECK (char_length(comment) <= 1000),
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_votes       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, created_at DESC);

-- ─── TRIGGER: auto-update updated_at ────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','categories','products','carts','orders','reviews']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
       CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- ─── TRIGGER: recalculate product ratings after review change ───
CREATE OR REPLACE FUNCTION recalc_product_ratings()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET
    ratings_average = COALESCE((SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM reviews WHERE product_id = pid), 0),
    ratings_count   = (SELECT COUNT(*) FROM reviews WHERE product_id = pid)
  WHERE id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_recalc ON reviews;
CREATE TRIGGER trg_reviews_recalc
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalc_product_ratings();

-- ─── ROW LEVEL SECURITY (optional — recommended) ────────────────
-- Uncomment if you want RLS on top of service-role queries.
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
