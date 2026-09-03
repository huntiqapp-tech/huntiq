CREATE TABLE IF NOT EXISTS price_rarity_assessments (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_price NUMERIC(12,2) NOT NULL CHECK (current_price >= 0),
  sample_size INTEGER NOT NULL CHECK (sample_size >= 0),
  history_median NUMERIC(12,2),
  price_percentile NUMERIC(8,5),
  near_low_share NUMERIC(8,5),
  days_since_comparable_low NUMERIC(10,1),
  rarity_score NUMERIC(8,5) NOT NULL,
  adjusted_anomaly_score NUMERIC(8,5),
  confidence_adjusted_profit NUMERIC(12,2),
  confidence_adjusted_roi NUMERIC(10,2),
  alert_action TEXT NOT NULL CHECK (alert_action IN ('preserve','standard','digest')),
  reason TEXT NOT NULL,
  assessment_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_price_rarity_opportunity_assessed ON price_rarity_assessments(opportunity_id, assessed_at DESC);
