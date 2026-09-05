-- HUNTIQ v0.9.102
-- Only individually verified completed-sale evidence may authorize customer sold depth, economics, or alerts.

create table if not exists customer_live_resale_verification_integrity (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  supplied_completed_sale_count integer not null check (supplied_completed_sale_count >= 0),
  verified_completed_sale_count integer not null check (verified_completed_sale_count >= 0),
  rejected_unverified_sale_count integer not null check (rejected_unverified_sale_count >= 0),
  resale_ready boolean not null,
  conservative_profit numeric(12,2),
  conservative_roi_pct numeric(9,2),
  customer_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (verified_completed_sale_count + rejected_unverified_sale_count <= supplied_completed_sale_count),
  check (resale_ready = false or verified_completed_sale_count >= 3),
  check (verified_completed_sale_count >= 3 or resale_ready = false),
  check (resale_ready or coalesce(conservative_profit, 0) = 0),
  check (resale_ready or coalesce(conservative_roi_pct, 0) = 0),
  check (resale_ready or customer_alert_eligible = false)
);

create index if not exists customer_live_resale_verification_integrity_opportunity_idx
  on customer_live_resale_verification_integrity(opportunity_id, evaluated_at desc);

comment on table customer_live_resale_verification_integrity is
  'Audit boundary proving unverified completed-sale rows cannot supply resale readiness, conservative profit/ROI authority, or customer alerts.';
