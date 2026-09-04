-- HUNTIQ v0.9.94
-- Audit price-history freshness so stale baselines cannot retain anomaly/alert authority.

create table if not exists price_history_freshness_audit (
  id bigint generated always as identity primary key,
  opportunity_key text not null,
  retailer text not null,
  product_identity text not null,
  store_id text,
  channel text,
  baseline_observation_count integer not null check (baseline_observation_count >= 0),
  baseline_latest_observed_at timestamptz,
  baseline_latest_age_hours numeric(12,2) check (baseline_latest_age_hours is null or baseline_latest_age_hours >= 0),
  baseline_freshness_score numeric(6,5) not null check (baseline_freshness_score between 0 and 1),
  baseline_confidence integer not null check (baseline_confidence between 0 and 100),
  anomaly_score integer not null check (anomaly_score between 0 and 100),
  anomaly_confidence integer not null check (anomaly_confidence between 0 and 100),
  history_stale boolean not null,
  anomaly_label text not null,
  urgent_alert_eligible boolean not null default false,
  evaluated_at timestamptz not null default now(),
  check (history_stale = (baseline_freshness_score < 0.35)),
  check (not history_stale or anomaly_label = 'Stale History - Verify'),
  check (not history_stale or urgent_alert_eligible = false)
);

create index if not exists price_history_freshness_audit_opportunity_idx
  on price_history_freshness_audit (opportunity_key, evaluated_at desc);

comment on table price_history_freshness_audit is
  'Records baseline recency, freshness authority, anomaly confidence, and fail-closed alert eligibility for HUNTIQ price-history decisions.';
