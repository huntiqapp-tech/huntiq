create table if not exists multi_unit_resale_exposure_assessments (
  id integer primary key generated always as identity,
  opportunity_id text not null,
  retailer text,
  store_id text,
  product_key text,
  assessed_at timestamptz not null default now(),
  purchase_quantity integer not null check (purchase_quantity >= 1),
  sold_count_30 numeric not null default 0,
  sold_count_90 numeric not null default 0,
  monthly_demand numeric not null default 0,
  demand_coverage_ratio numeric not null default 0,
  estimated_liquidation_days numeric not null,
  quantity_penalty numeric not null default 0,
  exposure_score integer not null check (exposure_score between 0 and 100),
  exposure_band text not null,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_multi_unit_exposure_opportunity on multi_unit_resale_exposure_assessments(opportunity_id, assessed_at desc);
create index if not exists idx_multi_unit_exposure_product on multi_unit_resale_exposure_assessments(retailer, store_id, product_key, assessed_at desc);
-- Derived evaluator evidence only. Never write effective/unit liquidation values back into raw retailer price history or raw completed-sale evidence.