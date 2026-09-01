-- Capital velocity / liquidity metrics for opportunity economics snapshots.
ALTER TABLE opportunity_economics_snapshots ADD COLUMN estimated_days_to_sell REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN sell_through_rate REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN turns_per_year REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN profit_per_30_days REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN roi_per_30_days REAL;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN liquidity_score INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN liquidity_band TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN capital_efficiency_score INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN liquidity_alert_penalty INTEGER DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN liquidity_alert_warning TEXT;
CREATE INDEX IF NOT EXISTS idx_opportunity_economics_liquidity ON opportunity_economics_snapshots(liquidity_band, capital_efficiency_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_economics_velocity ON opportunity_economics_snapshots(profit_per_30_days DESC, roi_per_30_days DESC);