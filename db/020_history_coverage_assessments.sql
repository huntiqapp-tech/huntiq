-- HUNTIQ v0.9.30
-- Persist the quality of the observation cadence used to support a store-local price anomaly.
-- Raw observations remain immutable; this table records evaluator-level coverage evidence only.

create table if not exists price_history_coverage_assessments (
  id integer primary key,
  retailer text not null,
  product_key text not null,
  location_key text not null,
  assessed_at text not null,
  sample_count integer not null default 0 check (sample_count >= 0),
  unique_observation_count integer not null default 0 check (unique_observation_count >= 0),
  span_days real not null default 0 check (span_days >= 0),
  inferred_interval_days real not null default 7 check (inferred_interval_days > 0),
  median_gap_days real not null default 0 check (median_gap_days >= 0),
  max_gap_days real not null default 0 check (max_gap_days >= 0),
  history_coverage_score integer not null check (history_coverage_score between 0 and 100),
  assessment_method text not null default 'cadence-density-gap-v1',
  created_at text not null default (datetime('now'))
);

create index if not exists idx_price_history_coverage_identity
  on price_history_coverage_assessments (retailer, product_key, location_key, assessed_at desc);
