-- HUNTIQ v0.9.37: derived audit trail for multi-buy redemption caps and offer-group eligibility.
-- Raw retailer price observations remain immutable and must not be rewritten by promotion economics.
CREATE TABLE IF NOT EXISTS promotion_redemption_limit_evaluations (
  id INTEGER PRIMARY KEY,
  evaluation_id TEXT NOT NULL,
  retailer TEXT,
  location_id TEXT,
  product_id TEXT,
  promotion_type TEXT NOT NULL,
  mix_and_match INTEGER NOT NULL DEFAULT 1,
  redemption_limit INTEGER,
  available_redemptions INTEGER NOT NULL DEFAULT 0,
  applied_redemptions INTEGER NOT NULL DEFAULT 0,
  eligible_unit_count INTEGER NOT NULL DEFAULT 0,
  total_discount NUMERIC NOT NULL DEFAULT 0,
  current_item_discount NUMERIC NOT NULL DEFAULT 0,
  current_item_effective_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  reasons_json TEXT NOT NULL DEFAULT '[]',
  warnings_json TEXT NOT NULL DEFAULT '[]',
  evaluated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_promo_redemption_eval_lookup
  ON promotion_redemption_limit_evaluations(retailer, location_id, product_id, evaluated_at);
