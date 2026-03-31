-- Run this entire file in Supabase Dashboard → SQL Editor

-- 1. TABLES

CREATE TABLE IF NOT EXISTS customers (
  customer_id       TEXT PRIMARY KEY,
  full_name         TEXT NOT NULL,
  email             TEXT,
  gender            TEXT,
  birthdate         DATE,
  created_at        TIMESTAMPTZ,
  city              TEXT,
  state             TEXT,
  zip_code          TEXT,
  customer_segment  TEXT,
  loyalty_tier      TEXT,
  is_active         BOOLEAN
);

CREATE TABLE IF NOT EXISTS products (
  product_id    TEXT PRIMARY KEY,
  sku           TEXT,
  product_name  TEXT NOT NULL,
  category      TEXT,
  price         NUMERIC(10,2),
  cost          NUMERIC(10,2),
  is_active     BOOLEAN
);

CREATE TABLE IF NOT EXISTS orders (
  order_id        TEXT PRIMARY KEY,
  customer_id     TEXT REFERENCES customers(customer_id),
  order_datetime  TIMESTAMPTZ,
  billing_zip     TEXT,
  shipping_zip    TEXT,
  shipping_state  TEXT,
  payment_method  TEXT,
  device_type     TEXT,
  ip_country      TEXT,
  promo_used      BOOLEAN,
  promo_code      TEXT,
  order_subtotal  NUMERIC(10,2),
  shipping_fee    NUMERIC(10,2),
  tax_amount      NUMERIC(10,2),
  order_total     NUMERIC(10,2),
  risk_score      NUMERIC(6,4),
  is_fraud        BOOLEAN
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id  TEXT PRIMARY KEY,
  order_id       TEXT REFERENCES orders(order_id),
  product_id     TEXT REFERENCES products(product_id),
  quantity       INTEGER,
  unit_price     NUMERIC(10,2),
  line_total     NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS shipments (
  shipment_id      TEXT PRIMARY KEY,
  order_id         TEXT REFERENCES orders(order_id),
  ship_datetime    TIMESTAMPTZ,
  carrier          TEXT,
  shipping_method  TEXT,
  distance_band    TEXT,
  promised_days    INTEGER,
  actual_days      INTEGER,
  late_delivery    BOOLEAN,
  late_score       NUMERIC(6,4) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS product_reviews (
  review_id        TEXT PRIMARY KEY,
  customer_id      TEXT REFERENCES customers(customer_id),
  product_id       TEXT REFERENCES products(product_id),
  rating           INTEGER,
  review_datetime  TIMESTAMPTZ,
  review_text      TEXT
);

-- 2. DISABLE RLS (no-auth app)

ALTER TABLE customers       DISABLE ROW LEVEL SECURITY;
ALTER TABLE products        DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders          DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments       DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews DISABLE ROW LEVEL SECURITY;

-- 3. INDEXES

CREATE INDEX IF NOT EXISTS idx_orders_customer_id      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id      ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_late_score    ON shipments(late_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id      ON product_reviews(product_id);
