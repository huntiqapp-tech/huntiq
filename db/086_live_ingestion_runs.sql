-- HUNTIQ live ingestion run audit. Schema-only; this repository has no database writer.
-- Observations remain shadow/internal. Alerts and history promotion stay disabled.

create table if not exists live_ingestion_runs (
  id bigserial primary key,
  run_id text not null unique,
  mode text not null check (mode in ('dry-run', 'live')),
  providers text[] not null,
  requested_count integer not null default 0,
  request_count integer not null default 0,
  accepted_count integer not null default 0,
  identity_count integer not null default 0,
  rejected_count integer not null default 0,
  duplicate_count integer not null default 0,
  skipped_count integer not null default 0,
  overlap_skipped boolean not null default false,
  fail_closed boolean not null default false,
  partial boolean not null default false,
  validation_state text not null default 'shadow',
  alerts_enabled boolean not null default false,
  history_promotion_allowed boolean not null default false,
  redistributable boolean not null default false,
  budget_max_records_per_run integer,
  budget_max_records_per_month integer,
  month_to_date_records integer,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  recorded_at timestamptz not null default now(),
  check (alerts_enabled = false),
  check (history_promotion_allowed = false),
  check (redistributable = false)
);

create table if not exists live_ingestion_run_items (
  id bigserial primary key,
  run_id text not null references live_ingestion_runs(run_id) on delete cascade,
  provider text not null,
  job_fingerprint text not null,
  observation_fingerprint text,
  retailer text,
  sku text,
  upc text,
  store_id text,
  zip text,
  channel text,
  observed_at timestamptz,
  status text not null,
  reason text,
  error_code text,
  error_message text,
  recorded_at timestamptz not null default now()
);

create unique index if not exists live_ingestion_run_item_idempotency_idx
  on live_ingestion_run_items(provider, job_fingerprint, (coalesce(observation_fingerprint, '')));

create table if not exists live_ingestion_locks (
  lock_name text primary key,
  holder_pid integer,
  acquired_at timestamptz not null,
  expires_at timestamptz not null
);

create index if not exists live_ingestion_runs_recorded_idx
  on live_ingestion_runs(recorded_at desc, mode, validation_state);
