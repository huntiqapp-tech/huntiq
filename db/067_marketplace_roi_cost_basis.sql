-- HUNTIQ v0.9.92: marketplace ROI must use the same full modeled cost basis as profit.
alter table if exists pwa_marketplace_economics
  add column if not exists total_cost_basis numeric(12,2),
  add column if not exists roi_cost_basis text default 'all-modeled-selling-costs';

alter table if exists pwa_marketplace_economics
  drop constraint if exists pwa_marketplace_economics_total_cost_basis_check;
alter table if exists pwa_marketplace_economics
  add constraint pwa_marketplace_economics_total_cost_basis_check
  check (total_cost_basis is null or total_cost_basis >= acquisition_cost);

create table if not exists marketplace_roi_cost_basis_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  gross_seller_revenue numeric(12,2) not null check (gross_seller_revenue >= 0),
  acquisition_cost numeric(12,2) not null check (acquisition_cost >= 0),
  marketplace_fee numeric(12,2) not null default 0 check (marketplace_fee >= 0),
  payment_fee numeric(12,2) not null default 0 check (payment_fee >= 0),
  return_reserve numeric(12,2) not null default 0 check (return_reserve >= 0),
  tax_drag numeric(12,2) not null default 0 check (tax_drag >= 0),
  fulfillment_cost numeric(12,2) not null default 0 check (fulfillment_cost >= 0),
  total_cost_basis numeric(12,2) not null check (total_cost_basis >= 0),
  net_profit numeric(12,2) not null,
  roi_pct numeric(9,2) not null,
  evidence_adjusted_profit numeric(12,2),
  evidence_adjusted_roi_pct numeric(9,2),
  urgent_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (total_cost_basis = acquisition_cost + marketplace_fee + payment_fee + return_reserve + tax_drag + fulfillment_cost),
  check (net_profit = gross_seller_revenue - total_cost_basis)
);

comment on table marketplace_roi_cost_basis_audit is 'Proves HUNTIQ ROI and alert gating use acquisition plus all modeled selling/fulfillment costs, not purchase price alone.';
