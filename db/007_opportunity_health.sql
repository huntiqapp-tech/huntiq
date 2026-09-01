-- HUNTIQ opportunity-health projection for ranked customer feeds.
-- Keeps deterministic scoring outputs queryable without replacing raw observation/history tables.
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS huntiq_score INTEGER;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS health_state TEXT;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS customer_recommendation TEXT;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS health_blockers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS health_watch_reasons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS health_badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS health_components JSONB DEFAULT '{}'::jsonb;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS lifecycle_phase TEXT;
ALTER TABLE opportunity_economics ADD COLUMN IF NOT EXISTS freshness_score NUMERIC;

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_health_feed
  ON opportunity_economics (health_state, huntiq_score DESC, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_customer_recommendation
  ON opportunity_economics (customer_recommendation, huntiq_score DESC);

COMMENT ON COLUMN opportunity_economics.huntiq_score IS '0-99 customer-facing HUNTIQ score derived from anomaly, resale, evidence, history, economics, downside and freshness.';
COMMENT ON COLUMN opportunity_economics.health_state IS 'BUY-READY, WATCH, or BLOCKED deterministic opportunity-health gate.';
COMMENT ON COLUMN opportunity_economics.customer_recommendation IS 'STRONG BUY, BUY, WAIT, or SKIP customer presentation state.';
