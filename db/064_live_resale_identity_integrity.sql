-- HUNTIQ live resale identity-integrity audit boundary.
-- Customer-live completed-sale evidence may influence resale confidence,
-- profit/ROI authority and alert readiness only after product binding succeeds.

create table if not exists live_resale_identity_integrity_assessments (
  id bigserial primary key,
  retailer text not null,
  product_identity text not null,
  assessed_at timestamptz not null default now(),
  supplied_completed_sale_count integer not null default 0 check (supplied_completed_sale_count >= 0),
  accepted_completed_sale_count integer not null default 0 check (accepted_completed_sale_count >= 0),
  rejected_missing_product_identity_count integer not null default 0 check (rejected_missing_product_identity_count >= 0),
  rejected_product_mismatch_count integer not null default 0 check (rejected_product_mismatch_count >= 0),
  rejected_status_or_value_count integer not null default 0 check (rejected_status_or_value_count >= 0),
  rejected_duplicate_count integer not null default 0 check (rejected_duplicate_count >= 0),
  precomputed_comp_identity_matches boolean not null default false,
  resale_ready boolean not null default false,
  conservative_profit numeric,
  conservative_roi numeric,
  alert_eligible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  check (accepted_completed_sale_count <= supplied_completed_sale_count),
  check (
    accepted_completed_sale_count
    + rejected_missing_product_identity_count
    + rejected_product_mismatch_count
    + rejected_status_or_value_count
    + rejected_duplicate_count
    <= supplied_completed_sale_count
  ),
  check (alert_eligible = false or resale_ready = true)
);

create index if not exists idx_live_resale_identity_integrity_lookup
  on live_resale_identity_integrity_assessments
  (retailer, product_identity, assessed_at desc);

comment on table live_resale_identity_integrity_assessments is
  'Audit record for product-binding completed-sale evidence before live resale, profit/ROI, and alert authority.';
