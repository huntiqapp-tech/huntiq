-- HUNTIQ v0.9.48
-- Derived audit layer for RetailerAPI shadow observations promoted into isolated
-- price history. This table does not authorize redistribution and does not
-- make shadow observations customer-alert eligible.

create table if not exists retailerapi_shadow_history_assessments (
  id bigserial primary key,
  retailer text not null,
  product_key text not null,
  location_key text not null,
  channel text not null default 'online',
  price numeric(12,2) not null,
  availability text,
  observed_at timestamptz not null,
  provider_record_id text,
  provider_status text,
  provider_retrieved_at timestamptz,
  validation_state text not null default 'shadow' check (validation_state = 'shadow'),
  data_state text not null default 'shadow-live' check (data_state = 'shadow-live'),
  alert_eligible boolean not null default false check (alert_eligible = false),
  rights_class text not null default 'internal-only',
  retention_policy text not null default 'unknown',
  redistribution_allowed boolean not null default false,
  anomaly_score numeric(8,4),
  anomaly_confidence numeric(8,4),
  evaluated_profit numeric(12,2),
  evaluated_roi numeric(10,4),
  decision text,
  suppression_reason text not null default 'provider-shadow-validation',
  assessment_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (retailer, product_key, location_key, observed_at, price, availability)
);

create index if not exists idx_retailerapi_shadow_history_lookup
  on retailerapi_shadow_history_assessments (retailer, product_key, location_key, observed_at desc);

comment on table retailerapi_shadow_history_assessments is
  'Internal-only RetailerAPI shadow-history audit snapshots. Rows remain alert-ineligible until provider/source validation and rights review are complete.';
