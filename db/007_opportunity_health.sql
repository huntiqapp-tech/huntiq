-- HUNTIQ opportunity-health persistence for ranked customer feeds.
-- This migration targets the SQLite snapshot table created in 005_opportunity_economics.sql.
ALTER TABLE opportunity_economics_snapshots ADD COLUMN huntiq_score INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN health_state TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN customer_recommendation TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN health_blockers TEXT NOT NULL DEFAULT '[]';
ALTER TABLE opportunity_economics_snapshots ADD COLUMN health_watch_reasons TEXT NOT NULL DEFAULT '[]';
ALTER TABLE opportunity_economics_snapshots ADD COLUMN health_badges TEXT NOT NULL DEFAULT '[]';
ALTER TABLE opportunity_economics_snapshots ADD COLUMN health_components TEXT NOT NULL DEFAULT '{}';
ALTER TABLE opportunity_economics_snapshots ADD COLUMN lifecycle_phase TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN freshness_score REAL;

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_health_feed
ON opportunity_economics_snapshots(health_state, huntiq_score DESC, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_customer_recommendation
ON opportunity_economics_snapshots(customer_recommendation, huntiq_score DESC);
