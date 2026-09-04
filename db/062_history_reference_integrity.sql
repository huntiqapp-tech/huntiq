-- HUNTIQ price-history reference-price integrity audit boundary.
-- MSRP/list/regular/compare-at/reference prices are context only and must never
-- enter historical shelf-price baselines or anomaly scoring as authoritative observations.

create table if not exists history_reference_integrity_assessments (
  id bigserial primary key,
  retailer text not null,
  sku text not null,
  channel text,
  location_key text,
  assessed_at timestamptz not null default now(),
  supplied_observation_count integer not null default 0 check (supplied_observation_count >= 0),
  eligible_raw_observation_count integer not null default 0 check (eligible_raw_observation_count >= 0),
  excluded_reference_observation_count integer not null default 0 check (excluded_reference_observation_count >= 0),
  excluded_promotion_observation_count integer not null default 0 check (excluded_promotion_observation_count >= 0),
  reference_contamination_pct numeric(5,2) not null default 0 check (reference_contamination_pct between 0 and 100),
  history_integrity_score numeric(5,2) not null default 100 check (history_integrity_score between 0 and 100),
  reference_prices_authoritative boolean not null default false check (reference_prices_authoritative = false),
  alert_eligible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  check (eligible_raw_observation_count + excluded_reference_observation_count + excluded_promotion_observation_count <= supplied_observation_count)
);

create index if not exists idx_history_reference_integrity_lookup
  on history_reference_integrity_assessments (retailer, sku, assessed_at desc);

comment on table history_reference_integrity_assessments is
  'Audit record proving reference/MSRP/list/regular/compare-at observations are quarantined from HUNTIQ price-history baselines and anomaly evidence.';
