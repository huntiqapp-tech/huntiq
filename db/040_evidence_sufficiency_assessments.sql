create table if not exists evidence_sufficiency_assessments (
  id integer primary key generated always as identity,
  opportunity_key text not null,
  assessed_at timestamptz not null default now(),
  history_quality numeric(5,1) not null,
  resale_quality numeric(5,1) not null,
  source_reliability numeric(5,1) not null,
  sufficiency_score integer not null check (sufficiency_score between 0 and 100),
  sufficiency_band text not null,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  adjusted_profit numeric(12,2),
  adjusted_roi numeric(10,1),
  adjusted_alert_level text,
  alert_eligible boolean not null default false
);
create index if not exists evidence_sufficiency_opportunity_idx on evidence_sufficiency_assessments(opportunity_key,assessed_at desc);