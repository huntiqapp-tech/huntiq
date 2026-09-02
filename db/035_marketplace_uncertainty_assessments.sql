-- HUNTIQ v0.9.44 — derived marketplace cost uncertainty audit layer.
-- Raw completed-sale evidence and retailer observations remain immutable.
create table if not exists marketplace_uncertainty_assessments (
  id bigserial primary key,
  opportunity_id text,
  marketplace text,
  assessed_at timestamptz not null default now(),
  fee_rate_uncertainty numeric(8,5) not null default 0,
  shipping_uncertainty_pct numeric(7,2) not null default 0,
  fixed_cost_buffer numeric(12,2) not null default 0,
  fee_buffer numeric(12,2) not null default 0,
  shipping_buffer numeric(12,2) not null default 0,
  uncertainty_cost numeric(12,2) not null default 0,
  base_profit numeric(12,2),
  base_roi numeric(8,2),
  conservative_profit numeric(12,2),
  conservative_roi numeric(8,2),
  uncertainty_score integer,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_marketplace_uncertainty_opportunity on marketplace_uncertainty_assessments(opportunity_id, assessed_at desc);
