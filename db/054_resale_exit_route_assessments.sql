CREATE TABLE IF NOT EXISTS resale_exit_route_assessments (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acquisition_cost NUMERIC(12,2) NOT NULL CHECK (acquisition_cost >= 0),
  best_route TEXT,
  runner_up_route TEXT,
  best_risk_adjusted_profit NUMERIC(12,2),
  best_risk_adjusted_roi NUMERIC(10,2),
  route_advantage NUMERIC(12,2),
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  alert_action TEXT NOT NULL CHECK (alert_action IN ('preserve','standard','digest')),
  route_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_resale_exit_route_opportunity_assessed ON resale_exit_route_assessments(opportunity_id, assessed_at DESC);
