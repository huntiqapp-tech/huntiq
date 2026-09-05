-- HUNTIQ v0.9.101
-- Only individually verified historical observations may contribute customer anomaly/economic/alert authority.

create table if not exists customer_live_history_verification_integrity (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  supplied_history_count integer not null check (supplied_history_count >= 0),
  verified_history_count integer not null check (verified_history_count >= 0),
  rejected_unverified_history_count integer not null check (rejected_unverified_history_count >= 0),
  history_ready boolean not null,
  anomaly_confidence numeric(6,2) not null check (anomaly_confidence between 0 and 100),
  conservative_profit numeric(12,2),
  conservative_roi_pct numeric(9,2),
  customer_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (verified_history_count + rejected_unverified_history_count <= supplied_history_count),
  check (history_ready or anomaly_confidence = 0),
  check (history_ready or coalesce(conservative_profit, 0) = 0),
  check (history_ready or coalesce(conservative_roi_pct, 0) = 0),
  check (history_ready or customer_alert_eligible = false)
);

create index if not exists customer_live_history_verification_integrity_opportunity_idx
  on customer_live_history_verification_integrity(opportunity_id, evaluated_at desc);

comment on table customer_live_history_verification_integrity is
  'Audit boundary proving unverified historical rows cannot supply price-history depth, anomaly confidence, conservative profit/ROI, or urgent customer alerts.';
