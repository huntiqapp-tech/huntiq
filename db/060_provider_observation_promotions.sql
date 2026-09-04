create table if not exists provider_observation_promotions (
  id bigserial primary key,
  provider text not null,
  retailer text not null,
  snapshot_id text,
  provider_record_id text,
  observation_hash text not null,
  product_id text,
  sku text,
  upc text,
  model_number text,
  store_id text,
  zip text,
  channel text,
  observed_price numeric(12,2) not null,
  source_checked_price numeric(12,2) not null,
  observed_at timestamptz not null,
  source_checked_at timestamptz not null,
  manual_source_check_passed boolean not null default false,
  display_rights_allowed boolean not null default false,
  retention_rights_allowed boolean not null default false,
  redistribution_rights_allowed boolean not null default false,
  history_promotion_allowed boolean not null default false,
  validation_state text not null default 'shadow-review-required',
  alert_eligible boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  review_notes jsonb not null default '[]'::jsonb,
  promoted_at timestamptz,
  recorded_at timestamptz not null default now(),
  check (alert_eligible = false),
  check (history_promotion_allowed = false or (manual_source_check_passed and retention_rights_allowed and validation_state = 'validated'))
);

create unique index if not exists provider_observation_promotions_hash_idx
  on provider_observation_promotions(provider, observation_hash);

create index if not exists provider_observation_promotions_review_idx
  on provider_observation_promotions(provider, retailer, validation_state, history_promotion_allowed, recorded_at desc);
