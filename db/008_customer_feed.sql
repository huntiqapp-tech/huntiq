-- Customer feed persistence for ranked, actionable opportunities.
ALTER TABLE opportunity_economics_snapshots ADD COLUMN feed_priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN feed_bucket TEXT NOT NULL DEFAULT 'watch';
ALTER TABLE opportunity_economics_snapshots ADD COLUMN alert_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN price_history_sample_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN price_history_span_days REAL NOT NULL DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN resale_confidence REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN anomaly_confidence REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN freshness_score REAL;

CREATE INDEX IF NOT EXISTS idx_opp_feed_priority
ON opportunity_economics_snapshots(feed_bucket, feed_priority DESC, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_opp_alert_ready
ON opportunity_economics_snapshots(alert_ready, feed_priority DESC, observed_at DESC);
