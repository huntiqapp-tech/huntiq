-- HUNTIQ v0.9.95
-- Audit retail-history and resale-comp freshness at the final customer alert boundary.

create table if not exists temporal_evidence_alert_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  history_freshness_score numeric(6,2) not null check (history_freshness_score between 0 and 100),
  resale_freshness_score numeric(6,2) not null check (resale_freshness_score between 0 and 100),
  temporal_trust_score numeric(6,2) not null check (temporal_trust_score between 0 and 100),
  history_stale boolean not null,
  resale_stale boolean not null,
  raw_anomaly_confidence numeric(6,2) not null check (raw_anomaly_confidence between 0 and 100),
  customer_anomaly_confidence numeric(6,2) not null check (customer_anomaly_confidence between 0 and 100),
  evidence_adjusted_profit numeric(12,2),
  evidence_adjusted_roi_pct numeric(9,2),
  alert_priority integer not null check (alert_priority between 0 and 100),
  urgent_alert_eligible boolean not null,
  reasons jsonb not null default '[]'::jsonb,
  primary key (opportunity_id, evaluated_at),
  check (customer_anomaly_confidence <= history_freshness_score),
  check (not history_stale or history_freshness_score < 35),
  check (not resale_stale or resale_freshness_score < 45),
  check (not history_stale or urgent_alert_eligible = false),
  check (not resale_stale or urgent_alert_eligible = false),
  check ((not history_stale and not resale_stale) or alert_priority <= 29)
);

create index if not exists temporal_evidence_alert_audit_opportunity_idx
  on temporal_evidence_alert_audit(opportunity_id, evaluated_at desc);

comment on table temporal_evidence_alert_audit is
  'Fail-closed audit boundary proving stale retail history or stale resale comparisons cannot retain urgent HUNTIQ alert authority, inflated anomaly confidence, or unadjusted profit/ROI authority.';
