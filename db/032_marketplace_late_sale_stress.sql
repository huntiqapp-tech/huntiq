-- HUNTIQ v0.9.41
-- Derived marketplace-specific late-sale stress. Raw retailer observations and raw sold comps remain immutable.
CREATE TABLE IF NOT EXISTS marketplace_late_sale_stress (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  purchase_quantity INTEGER NOT NULL CHECK (purchase_quantity > 0),
  base_sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  base_fee_rate NUMERIC(8,6) NOT NULL DEFAULT 0,
  base_shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  fee_rate_drift_per_30d NUMERIC(8,6) NOT NULL DEFAULT 0,
  shipping_inflation_pct_per_30d NUMERIC(8,3) NOT NULL DEFAULT 0,
  holding_cost_per_unit_per_30d NUMERIC(12,2) NOT NULL DEFAULT 0,
  stressed_avg_sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_fee_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_holding_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost_drag NUMERIC(12,2) NOT NULL DEFAULT 0,
  stressed_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  stressed_roi NUMERIC(10,2) NOT NULL DEFAULT 0,
  stress_score INTEGER NOT NULL DEFAULT 0 CHECK (stress_score BETWEEN 0 AND 100),
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  horizons JSONB NOT NULL DEFAULT '[]'::jsonb,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_late_sale_opportunity ON marketplace_late_sale_stress(opportunity_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS history_clock_integrity_assessments (
  id BIGSERIAL PRIMARY KEY,
  retailer TEXT,
  store_id TEXT,
  product_key TEXT NOT NULL,
  raw_observation_count INTEGER NOT NULL DEFAULT 0,
  future_observation_count INTEGER NOT NULL DEFAULT 0,
  future_tolerance_minutes INTEGER NOT NULL DEFAULT 5,
  accepted_observation_count INTEGER NOT NULL DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_history_clock_integrity_product ON history_clock_integrity_assessments(product_key, assessed_at DESC);