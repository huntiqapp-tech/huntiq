create table if not exists history_promotion_assessments (
  id bigint generated always as identity primary key,
  retailer text not null,
  sku text not null,
  channel text not null,
  location_key text not null,
  observed_at timestamptz not null,
  assessed_at timestamptz not null default now(),
  provider text,
  provider_record_id text,
  validation_state text not null,
  source_reliability numeric(5,2),
  observation_confidence numeric(5,2),
  rights_class text,
  retention_policy text,
  redistribution_allowed boolean not null default false,
  eligible_for_persistent_history boolean not null,
  eligible_for_customer_redistribution boolean not null,
  age_hours numeric(10,2),
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists history_promotion_assessments_lookup_idx
  on history_promotion_assessments (retailer, sku, channel, location_key, observed_at desc);

create index if not exists history_promotion_assessments_eligibility_idx
  on history_promotion_assessments (eligible_for_persistent_history, assessed_at desc);

comment on table history_promotion_assessments is
  'Audits whether a normalized retailer observation may enter persistent HUNTIQ price history. Shadow/unvalidated, stale, weak-reliability, or retention-rights-unclear observations remain excluded from anomaly baselines.';
