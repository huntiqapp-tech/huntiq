-- HUNTIQ v0.9.96
-- Audit completeness of temporal evidence at the final customer decision boundary.

create table if not exists temporal_evidence_completeness_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  history_freshness_known boolean not null,
  resale_freshness_known boolean not null,
  history_freshness_score numeric(6,2) not null check (history_freshness_score between 0 and 100),
  resale_freshness_score numeric(6,2) not null check (resale_freshness_score between 0 and 100),
  temporal_evidence_complete boolean not null,
  temporal_trust_score numeric(6,2) not null check (temporal_trust_score between 0 and 100),
  customer_anomaly_confidence numeric(6,2) not null check (customer_anomaly_confidence between 0 and 100),
  evidence_adjusted_profit numeric(12,2),
  evidence_adjusted_roi_pct numeric(9,2),
  alert_priority integer not null check (alert_priority between 0 and 100),
  urgent_alert_eligible boolean not null,
  reasons jsonb not null default '[]'::jsonb,
  primary key (opportunity_id, evaluated_at),
  check (temporal_evidence_complete = (history_freshness_known and resale_freshness_known)),
  check (history_freshness_known or history_freshness_score = 0),
  check (resale_freshness_known or resale_freshness_score = 0),
  check (temporal_evidence_complete or temporal_trust_score = 0),
  check (history_freshness_known or customer_anomaly_confidence = 0),
  check (temporal_evidence_complete or coalesce(evidence_adjusted_profit, 0) = 0),
  check (temporal_evidence_complete or coalesce(evidence_adjusted_roi_pct, 0) = 0),
  check (temporal_evidence_complete or urgent_alert_eligible = false),
  check (temporal_evidence_complete or alert_priority <= 19)
);

create index if not exists temporal_evidence_completeness_audit_opportunity_idx
  on temporal_evidence_completeness_audit(opportunity_id, evaluated_at desc);

comment on table temporal_evidence_completeness_audit is
  'Fail-closed audit boundary proving missing retail-history or resale-comp freshness cannot be interpreted as perfect recency or authorize anomaly confidence, evidence-adjusted profit/ROI, or urgent customer alerts.';
