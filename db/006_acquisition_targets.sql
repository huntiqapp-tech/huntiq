-- HUNTIQ acquisition-target persistence
-- Stores backwards-solved buy ceilings so alerts can distinguish a good deal
-- from a deal that still misses the user's required ROI.

ALTER TABLE opportunity_economics_snapshots ADD COLUMN break_even_max_buy REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN max_buy_roi_25 REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN max_buy_roi_50 REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN max_buy_roi_100 REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN acquisition_headroom REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN roi_50_headroom REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN anomaly_lifecycle TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN anomaly_persistence_count INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN anomaly_lifecycle_urgency INTEGER;

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_roi50_headroom
ON opportunity_economics_snapshots(roi_50_headroom DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_lifecycle
ON opportunity_economics_snapshots(anomaly_lifecycle, anomaly_lifecycle_urgency DESC);
