-- HUNTIQ v0.9.78
-- Auditable release/readiness boundary for provider-backed opportunities.
CREATE TABLE IF NOT EXISTS live_opportunity_readiness_assessments (
  id INTEGER PRIMARY KEY,
  opportunity_key TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_record_id TEXT,
  assessed_at TEXT NOT NULL,
  authenticated_lookup_passed INTEGER NOT NULL DEFAULT 0,
  manual_source_check_passed INTEGER NOT NULL DEFAULT 0,
  customer_display_allowed INTEGER NOT NULL DEFAULT 0,
  redistribution_allowed INTEGER NOT NULL DEFAULT 0,
  history_promoted INTEGER NOT NULL DEFAULT 0,
  history_sample_count INTEGER NOT NULL DEFAULT 0,
  promoted_history_count INTEGER NOT NULL DEFAULT 0,
  anomaly_confidence REAL NOT NULL DEFAULT 0,
  resale_sold_count INTEGER NOT NULL DEFAULT 0,
  resale_confidence REAL NOT NULL DEFAULT 0,
  expected_profit REAL NOT NULL DEFAULT 0,
  expected_roi REAL NOT NULL DEFAULT 0,
  downside_profit REAL NOT NULL DEFAULT 0,
  downside_roi REAL NOT NULL DEFAULT 0,
  readiness_score REAL NOT NULL DEFAULT 0,
  history_disposition TEXT NOT NULL CHECK(history_disposition IN ('shadow-quarantine','validated-history')),
  conservative_profit REAL NOT NULL DEFAULT 0,
  conservative_roi REAL NOT NULL DEFAULT 0,
  alert_action TEXT NOT NULL CHECK(alert_action IN ('instant','standard','suppressed')),
  blockers_json TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_live_readiness_opportunity_time
  ON live_opportunity_readiness_assessments(opportunity_key, assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_readiness_provider_record
  ON live_opportunity_readiness_assessments(provider, provider_record_id);
