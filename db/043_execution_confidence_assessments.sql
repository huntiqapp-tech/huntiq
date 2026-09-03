create table if not exists execution_confidence_assessments (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  current_price numeric not null,
  confirmation_count integer not null default 0,
  confirmation_span_hours numeric,
  newest_confirmation_age_hours numeric,
  availability_score integer not null default 0,
  anomaly_confidence numeric,
  execution_score integer not null check (execution_score between 0 and 100),
  transact_probability_pct integer not null check (transact_probability_pct between 0 and 100),
  base_profit numeric,
  failure_cost numeric not null default 0,
  expected_profit numeric,
  expected_roi numeric,
  conservative_roi numeric,
  blockers jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  alert_eligible boolean not null default false,
  method text not null default 'repeat-price-availability-execution-adjusted-economics',
  evidence jsonb not null default '{}'::jsonb
);
create index if not exists execution_confidence_opportunity_time_idx on execution_confidence_assessments(opportunity_id, assessed_at desc);