create table if not exists evidence_agreement_assessments (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  retailer_price_count integer not null default 0,
  retailer_spread_pct numeric,
  resale_estimate_count integer not null default 0,
  resale_spread_pct numeric,
  roi_scenario_count integer not null default 0,
  roi_spread numeric,
  retailer_score integer not null,
  resale_score integer not null,
  roi_score integer not null,
  agreement_score integer not null,
  agreement_level text not null,
  blockers jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  alert_eligible boolean not null default false,
  method text not null,
  evidence jsonb not null default '{}'::jsonb,
  check (agreement_score between 0 and 100)
);
create index if not exists evidence_agreement_opportunity_time_idx on evidence_agreement_assessments (opportunity_id, assessed_at desc);