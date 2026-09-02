-- HUNTIQ v0.9.29
-- Persist robust completed-sale price-integrity evidence separately from raw comparables.
-- This table records what the evaluator used; it does not rewrite or delete source evidence.

create table if not exists resale_price_integrity_assessments (
  id integer primary key generated always as identity,
  opportunity_key text not null,
  market_value_window_days integer not null check (market_value_window_days in (30,60,90)),
  raw_completed_sale_count integer not null default 0 check (raw_completed_sale_count >= 0),
  accepted_completed_sale_count integer not null default 0 check (accepted_completed_sale_count >= 0),
  filtered_outlier_count integer not null default 0 check (filtered_outlier_count >= 0),
  price_integrity_score numeric(5,2) not null check (price_integrity_score between 0 and 100),
  outlier_lower_bound numeric(12,2),
  outlier_upper_bound numeric(12,2),
  robust_market_value numeric(12,2),
  resale_confidence numeric(5,2) check (resale_confidence between 0 and 100),
  assessment_method text not null default 'iqr-1.5',
  assessed_at timestamptz not null default now(),
  constraint resale_integrity_counts_valid check (accepted_completed_sale_count + filtered_outlier_count <= raw_completed_sale_count)
);

create index if not exists resale_price_integrity_opportunity_time_idx
  on resale_price_integrity_assessments (opportunity_key, assessed_at desc);

comment on table resale_price_integrity_assessments is
  'Audit trail for robust sold-comp filtering. Raw completed-sale evidence remains immutable; this stores evaluator-derived acceptance/outlier statistics only.';