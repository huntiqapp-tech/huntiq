-- Persist the cross-signal evidence gate used by feed ranking and alert delivery.
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_score INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_confidence_band TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_alert_eligible INTEGER NOT NULL DEFAULT 0;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_alert_level TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_blockers_json TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_warnings_json TEXT;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_history_confidence INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_anomaly_confidence INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_resale_confidence INTEGER;
ALTER TABLE opportunity_economics_snapshots ADD COLUMN evidence_downside_roi REAL;

CREATE INDEX IF NOT EXISTS idx_opportunity_evidence_alert
  ON opportunity_economics_snapshots(evidence_alert_eligible, evidence_score DESC, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_evidence_band
  ON opportunity_economics_snapshots(evidence_confidence_band, evidence_score DESC);