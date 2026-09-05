-- HUNTIQ v0.9.97
-- Prove that resale freshness authority comes from timestamped completed-sale evidence.

create table if not exists resale_freshness_provenance_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  accepted_sold_count integer not null check (accepted_sold_count >= 0),
  dated_sold_count integer not null check (dated_sold_count >= 0),
  fresh_sold_count integer not null check (fresh_sold_count >= 0),
  stale_sold_count integer not null check (stale_sold_count >= 0),
  resale_freshness_known boolean not null,
  resale_freshness_score numeric(6,2) not null check (resale_freshness_score between 0 and 100),
  resale_freshness_source text not null,
  temporal_evidence_complete boolean not null,
  temporal_trust_score numeric(6,2) not null check (temporal_trust_score between 0 and 100),
  evidence_adjusted_profit numeric(12,2),
  evidence_adjusted_roi_pct numeric(9,2),
  alert_priority integer not null check (alert_priority between 0 and 100),
  urgent_alert_eligible boolean not null,
  reasons jsonb not null default '[]'::jsonb,
  primary key (opportunity_id, evaluated_at),
  check (dated_sold_count <= accepted_sold_count),
  check (fresh_sold_count <= dated_sold_count),
  check (stale_sold_count <= dated_sold_count),
  check (resale_freshness_known = (dated_sold_count > 0)),
  check (resale_freshness_known or resale_freshness_score = 0),
  check (resale_freshness_known or resale_freshness_source in ('undated-sold-comps','missing')),
  check (resale_freshness_known or temporal_evidence_complete = false),
  check (resale_freshness_known or temporal_trust_score = 0),
  check (resale_freshness_known or coalesce(evidence_adjusted_profit, 0) = 0),
  check (resale_freshness_known or coalesce(evidence_adjusted_roi_pct, 0) = 0),
  check (resale_freshness_known or urgent_alert_eligible = false),
  check (resale_freshness_known or alert_priority <= 19)
);

create index if not exists resale_freshness_provenance_audit_opportunity_idx
  on resale_freshness_provenance_audit(opportunity_id, evaluated_at desc);

comment on table resale_freshness_provenance_audit is
  'Audit boundary proving undated completed-sale depth cannot be converted into resale freshness, temporal trust, evidence-adjusted profit/ROI, or urgent customer alert authority.';
