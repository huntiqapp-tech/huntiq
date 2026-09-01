-- HUNTIQ v0.9.25: preserve provider provenance and rights boundaries for retailer observations.
-- This migration is intentionally additive so existing demo/test data remains compatible.

ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS provider_record_id TEXT;
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS retrieved_at TIMESTAMPTZ;
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS retention_policy TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS redistribution_allowed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS verification_state TEXT;
ALTER TABLE live_price_observations ADD COLUMN IF NOT EXISTS evidence_quality NUMERIC(5,4);

ALTER TABLE live_price_observations
  DROP CONSTRAINT IF EXISTS live_price_observations_retention_policy_check;
ALTER TABLE live_price_observations
  ADD CONSTRAINT live_price_observations_retention_policy_check
  CHECK (retention_policy IN ('unrestricted','ephemeral','source-limited','unknown'));

ALTER TABLE live_price_observations
  DROP CONSTRAINT IF EXISTS live_price_observations_evidence_quality_check;
ALTER TABLE live_price_observations
  ADD CONSTRAINT live_price_observations_evidence_quality_check
  CHECK (evidence_quality IS NULL OR (evidence_quality >= 0 AND evidence_quality <= 1));

CREATE INDEX IF NOT EXISTS idx_live_price_observations_provider_record
  ON live_price_observations(provider, provider_record_id);
CREATE INDEX IF NOT EXISTS idx_live_price_observations_rights
  ON live_price_observations(retention_policy, redistribution_allowed);

COMMENT ON COLUMN live_price_observations.retention_policy IS
  'Controls HUNTIQ historical persistence: unrestricted, ephemeral, source-limited, or unknown. Unknown/ephemeral observations must not be promoted into permanent history without source-specific authorization.';
COMMENT ON COLUMN live_price_observations.redistribution_allowed IS
  'True only when the controlling source terms explicitly permit redistribution of the stored observation.';
