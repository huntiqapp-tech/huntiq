-- HUNTIQ v0.9.31
-- Persist evaluator-level freshness evidence separately from immutable raw sold comparables.
create table if not exists resale_freshness_assessments (
  id bigint generated always as identity primary key,
  opportunity_key text not null,
  marketplace text,
  market_value_window_days integer not null check (market_value_window_days in (30,60,90)),
  completed_sale_count integer not null default 0 check (completed_sale_count >= 0),
  newest_sale_age_days numeric(10,2),
  median_sale_age_days numeric(10,2),
  resale_freshness_score integer not null check (resale_freshness_score between 0 and 100),
  resale_confidence integer check (resale_confidence between 0 and 100),
  evidence_sufficient boolean not null default false,
  assessed_at timestamptz not null default now()
);

create index if not exists idx_resale_freshness_opportunity_assessed
  on resale_freshness_assessments (opportunity_key, assessed_at desc);

comment on table resale_freshness_assessments is
  'Evaluator snapshots describing how recent completed-sale evidence is. Raw sold comparables remain immutable and are not rewritten by this assessment.';