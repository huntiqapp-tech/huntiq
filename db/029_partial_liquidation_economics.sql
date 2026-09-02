-- HUNTIQ v0.9.39: evaluator-level partial liquidation snapshots.
-- Derived risk/economics only; never rewrites raw retailer observations or completed-sale evidence.
create table if not exists partial_liquidation_economics (
  id integer primary key,
  opportunity_id text not null,
  evaluated_at text not null,
  retailer text,
  store_id text,
  product_key text,
  purchase_quantity integer not null check (purchase_quantity >= 1),
  monthly_demand real not null default 0,
  cost_per_unit real not null default 0,
  expected_profit_per_unit real not null default 0,
  units_sold_30 integer not null default 0,
  remaining_units_30 integer not null default 0,
  capital_tied_up_30 real not null default 0,
  realized_profit_30 real not null default 0,
  units_sold_60 integer not null default 0,
  remaining_units_60 integer not null default 0,
  capital_tied_up_60 real not null default 0,
  realized_profit_60 real not null default 0,
  units_sold_90 integer not null default 0,
  remaining_units_90 integer not null default 0,
  capital_tied_up_90 real not null default 0,
  realized_profit_90 real not null default 0,
  capital_at_risk_90_pct real not null default 0,
  partial_liquidation_score integer not null default 0,
  exposure_band text not null,
  blockers_json text,
  warnings_json text
);
create index if not exists idx_partial_liquidation_opportunity_time on partial_liquidation_economics(opportunity_id,evaluated_at desc);
create index if not exists idx_partial_liquidation_product_store on partial_liquidation_economics(retailer,store_id,product_key,evaluated_at desc);