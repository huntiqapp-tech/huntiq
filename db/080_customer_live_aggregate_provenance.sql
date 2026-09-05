-- HUNTIQ v0.9.105
-- Customer-live aggregate resale provenance integrity.
-- Provider aggregate resale values cannot be authoritative unless the aggregate
-- itself is verified, matches the exact product identity, and is backed by at
-- least three verified completed sales. If unverified aggregate data is present,
-- customer resale readiness, conservative economics, and alert authority must fail closed.

CREATE TABLE IF NOT EXISTS customer_live_aggregate_provenance_audit (
  provider_record_id TEXT PRIMARY KEY,
  exact_product_identity_match BOOLEAN NOT NULL DEFAULT FALSE,
  verified_completed_sale_count INTEGER NOT NULL DEFAULT 0 CHECK (verified_completed_sale_count >= 0),
  aggregate_present BOOLEAN NOT NULL DEFAULT FALSE,
  aggregate_verified BOOLEAN NOT NULL DEFAULT FALSE,
  aggregate_authoritative BOOLEAN NOT NULL DEFAULT FALSE,
  resale_ready BOOLEAN NOT NULL DEFAULT FALSE,
  conservative_profit NUMERIC NOT NULL DEFAULT 0,
  conservative_roi NUMERIC NOT NULL DEFAULT 0,
  customer_alert_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (
    NOT aggregate_authoritative OR (
      aggregate_present
      AND aggregate_verified
      AND exact_product_identity_match
      AND verified_completed_sale_count >= 3
    )
  ),

  CHECK (
    NOT (aggregate_present AND NOT aggregate_verified) OR (
      aggregate_authoritative = FALSE
      AND resale_ready = FALSE
      AND conservative_profit = 0
      AND conservative_roi = 0
      AND customer_alert_eligible = FALSE
    )
  ),

  CHECK (
    verified_completed_sale_count >= 3 OR (
      aggregate_authoritative = FALSE
      AND resale_ready = FALSE
      AND conservative_profit = 0
      AND conservative_roi = 0
      AND customer_alert_eligible = FALSE
    )
  )
);

COMMENT ON TABLE customer_live_aggregate_provenance_audit IS
  'Audits fail-closed customer authority for provider aggregate resale evidence.';
