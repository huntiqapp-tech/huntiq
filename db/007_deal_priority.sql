-- HUNTIQ opportunity prioritization fields
ALTER TABLE opportunity_economics ADD COLUMN annualized_roi REAL;
ALTER TABLE opportunity_economics ADD COLUMN capital_velocity_score INTEGER;
ALTER TABLE opportunity_economics ADD COLUMN capital_headroom_pct REAL;
ALTER TABLE opportunity_economics ADD COLUMN deal_priority INTEGER;
ALTER TABLE opportunity_economics ADD COLUMN alert_tier TEXT;
ALTER TABLE opportunity_economics ADD COLUMN alert_reason TEXT;
ALTER TABLE opportunity_economics ADD COLUMN suppress_pricing_error_language INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_priority
  ON opportunity_economics(deal_priority DESC, capital_velocity_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_economics_alert_tier
  ON opportunity_economics(alert_tier, deal_priority DESC);
