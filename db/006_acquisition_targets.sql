-- HUNTIQ acquisition-target persistence
-- Stores backwards-solved buy ceilings so alerts can distinguish a good deal
-- from a deal that still misses the user's required ROI.

ALTER TABLE opportunity_economics ADD COLUMN break_even_max_buy NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN max_buy_roi_25 NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN max_buy_roi_50 NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN max_buy_roi_100 NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN acquisition_headroom NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN roi_50_headroom NUMERIC;
ALTER TABLE opportunity_economics ADD COLUMN anomaly_lifecycle TEXT;
ALTER TABLE opportunity_economics ADD COLUMN anomaly_persistence_count INTEGER;
ALTER TABLE opportunity_economics ADD COLUMN anomaly_lifecycle_urgency INTEGER;

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_roi50_headroom
  ON opportunity_economics (roi_50_headroom DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_economics_lifecycle
  ON opportunity_economics (anomaly_lifecycle, anomaly_lifecycle_urgency DESC);
