create table if not exists inventory_scarcity_assessments (
  id bigint generated always as identity primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  score integer not null check (score between 0 and 100),
  sellout_risk text not null,
  wait_risk_score integer not null check (wait_risk_score between 0 and 100),
  timing text not null,
  max_wait_hours integer,
  current_count numeric,
  previous_count numeric,
  decline_pct numeric,
  observation_age_hours numeric,
  source_confidence numeric,
  ready_for_pickup boolean not null default false,
  available boolean not null default true,
  alert_eligible boolean not null default false,
  alert_priority text not null,
  blockers jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  method text not null,
  assessment jsonb not null default '{}'::jsonb
);
create index if not exists inventory_scarcity_assessments_opportunity_time_idx on inventory_scarcity_assessments(opportunity_id, assessed_at desc);
