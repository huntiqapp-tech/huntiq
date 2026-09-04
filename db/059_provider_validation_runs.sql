create table if not exists provider_validation_runs (
  id bigserial primary key,
  provider text not null,
  retailer text not null,
  dataset_id text,
  snapshot_id text,
  target_url text,
  target_zip text,
  requested_count integer not null default 0,
  returned_count integer not null default 0,
  normalized_count integer not null default 0,
  provider_status text not null,
  validation_state text not null default 'shadow-pending',
  manual_source_check_state text not null default 'pending',
  display_rights_state text not null default 'unverified',
  retention_rights_state text not null default 'unverified',
  redistribution_rights_state text not null default 'unverified',
  history_promotion_allowed boolean not null default false,
  alerts_enabled boolean not null default false,
  validation_notes jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  recorded_at timestamptz not null default now()
);

create unique index if not exists provider_validation_snapshot_idx
  on provider_validation_runs(provider, snapshot_id)
  where snapshot_id is not null;

create index if not exists provider_validation_review_queue_idx
  on provider_validation_runs(provider, retailer, validation_state, manual_source_check_state, recorded_at desc);
