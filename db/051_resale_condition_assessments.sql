CREATE TABLE IF NOT EXISTS resale_condition_assessments (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retail_condition TEXT NOT NULL,
  sold_count INTEGER NOT NULL DEFAULT 0,
  exact_count INTEGER NOT NULL DEFAULT 0,
  close_count INTEGER NOT NULL DEFAULT 0,
  incompatible_count INTEGER NOT NULL DEFAULT 0,
  condition_score NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL,
  blocker BOOLEAN NOT NULL DEFAULT FALSE,
  condition_factor NUMERIC(6,4),
  condition_adjusted_resale NUMERIC(12,2),
  condition_adjusted_profit NUMERIC(12,2),
  condition_adjusted_roi NUMERIC(10,2),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_resale_condition_assessments_opportunity_time ON resale_condition_assessments(opportunity_id, assessed_at DESC);