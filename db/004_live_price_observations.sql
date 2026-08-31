-- HUNTIQ live retailer observation history
-- PostgreSQL-compatible. Keeps local/store prices isolated and preserves provenance.
CREATE TABLE IF NOT EXISTS live_price_observations (
  id BIGSERIAL PRIMARY KEY,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  location_key TEXT NOT NULL,
  sku TEXT,
  product_id TEXT,
  model_number TEXT,
  upc TEXT,
  store_id TEXT,
  zipcode VARCHAR(5),
  channel TEXT NOT NULL DEFAULT 'online',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  availability TEXT,
  quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0),
  observed_at TIMESTAMPTZ NOT NULL,
  provider TEXT NOT NULL,
  dataset_id TEXT,
  rights_class TEXT NOT NULL DEFAULT 'internal-only',
  source_url TEXT,
  raw_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (retailer, product_key, location_key, observed_at, provider)
);

CREATE INDEX IF NOT EXISTS idx_live_price_history_lookup
  ON live_price_observations (retailer, product_key, location_key, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_price_recent
  ON live_price_observations (observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_price_sku
  ON live_price_observations (retailer, sku, zipcode, observed_at DESC);

-- Fast history feed for anomaly scoring. A location is deliberately required.
CREATE OR REPLACE VIEW live_price_history AS
SELECT retailer, product_key, location_key, price, availability, quantity,
       observed_at, provider, rights_class
FROM live_price_observations;
