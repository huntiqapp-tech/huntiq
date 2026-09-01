-- HUNTIQ v0.9.26 anomaly assessment snapshots
-- Persists the store-local history evidence used by the strict opportunity evaluator.
CREATE TABLE IF NOT EXISTS price_anomaly_assessments (
  id BIGSERIAL PRIMARY KEY,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  location_key TEXT NOT NULL,
  observation_id BIGINT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_price NUMERIC(12,2) NOT NULL CHECK (current_price >= 0),
  baseline_price NUMERIC(12,2),
  sample_count INTEGER NOT NULL DEFAULT 0 CHECK (sample_count >= 0),
  span_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  mad_pct NUMERIC(10,4),
  volatility_score INTEGER CHECK (volatility_score BETWEEN 0 AND 100),
  freshness_score INTEGER CHECK (freshness_score BETWEEN 0 AND 100),
  drop_pct NUMERIC(10,2),
  z_like NUMERIC(12,4),
  history_confidence INTEGER CHECK (history_confidence BETWEEN 0 AND 99),
  anomaly_label TEXT,
  UNIQUE (retailer, product_key, location_key, observation_id)
);
CREATE INDEX IF NOT EXISTS idx_price_anomaly_location_time ON price_anomaly_assessments (retailer, product_key, location_key, assessed_at DESC);
-- Never populate this table by blending locations; product_key + location_key is the baseline identity.