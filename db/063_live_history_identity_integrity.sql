-- HUNTIQ live-history identity integrity audit boundary.
-- Customer-live price history is allowed to influence anomaly/economics/alerts only
-- after timestamp, product, retailer, location/channel and provider identity checks pass.

create table if not exists live_history_identity_integrity_assessments (
  id bigserial primary key,
  retailer text not null,
  product_identity text not null,
  channel text not null,
  location_key text not null,
  provider text not null,
  assessed_at timestamptz not null default now(),
  supplied_observation_count integer not null default 0 check (supplied_observation_count >= 0),
  accepted_observation_count integer not null default 0 check (accepted_observation_count >= 0),
  rejected_missing_product_identity_count integer not null default 0 check (rejected_missing_product_identity_count >= 0),
  rejected_product_mismatch_count integer not null default 0 check (rejected_product_mismatch_count >= 0),
  rejected_location_or_channel_mismatch_count integer not null default 0 check (rejected_location_or_channel_mismatch_count >= 0),
  rejected_provider_mismatch_count integer not null default 0 check (rejected_provider_mismatch_count >= 0),
  rejected_time_or_value_count integer not null default 0 check (rejected_time_or_value_count >= 0),
  rejected_duplicate_count integer not null default 0 check (rejected_duplicate_count >= 0),
  history_ready boolean not null default false,
  alert_eligible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  check (accepted_observation_count <= supplied_observation_count),
  check (
    accepted_observation_count
    + rejected_missing_product_identity_count
    + rejected_product_mismatch_count
    + rejected_location_or_channel_mismatch_count
    + rejected_provider_mismatch_count
    + rejected_time_or_value_count
    + rejected_duplicate_count
    <= supplied_observation_count
  )
);

create index if not exists idx_live_history_identity_integrity_lookup
  on live_history_identity_integrity_assessments
  (retailer, product_identity, channel, location_key, provider, assessed_at desc);

comment on table live_history_identity_integrity_assessments is
  'Audit record for the fail-closed customer-live history boundary. Cross-product or identity-less rows cannot increase anomaly confidence, profit/ROI authority, or alert readiness.';