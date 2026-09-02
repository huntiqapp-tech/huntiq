-- HUNTIQ v0.9.33
-- Evaluator-level source-chain snapshots. Raw retailer observations and raw resale comps remain immutable.

create table if not exists evaluator_source_chain_assessments (
  id bigserial primary key,
  opportunity_key text not null,
  retailer text,
  product_key text,
  location_key text,
  assessed_at timestamptz not null default now(),
  retailer_source_score numeric(5,2),
  retailer_source_band text,
  resale_source_score numeric(5,2),
  resale_source_band text,
  combined_source_score numeric(5,2),
  combined_source_band text,
  source_reliability_haircut numeric(6,4),
  raw_risk_adjusted_profit numeric(14,2),
  source_adjusted_profit numeric(14,2),
  raw_risk_adjusted_roi numeric(10,2),
  source_adjusted_roi numeric(10,2),
  source_adjusted_downside_roi numeric(10,2),
  source_adjusted_confidence_roi numeric(10,2),
  alert_level text,
  alert_eligible boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists evaluator_source_chain_lookup_idx
  on evaluator_source_chain_assessments (opportunity_key, assessed_at desc);

create index if not exists evaluator_source_chain_product_location_idx
  on evaluator_source_chain_assessments (retailer, product_key, location_key, assessed_at desc);

comment on table evaluator_source_chain_assessments is
  'Derived evaluator snapshots separating retailer-source trust from completed-sale-source trust; does not replace or mutate raw evidence.';