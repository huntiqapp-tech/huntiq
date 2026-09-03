create table if not exists resale_supply_pressure_assessments (
  id bigserial primary key,
  opportunity_id text not null,
  marketplace text,
  active_listings integer not null default 0,
  sold_count integer not null default 0,
  sold_window_days integer not null default 30,
  sell_through_rate numeric(8,4),
  market_inventory_days numeric(10,1),
  pressure_level text not null,
  resale_haircut numeric(8,4) not null default 0,
  adjusted_resale_value numeric(12,2),
  adjusted_profit numeric(12,2),
  adjusted_roi numeric(10,2),
  alert_action text not null,
  blocked boolean not null default false,
  assessed_at timestamptz not null default now()
);

create index if not exists idx_resale_supply_pressure_opportunity
  on resale_supply_pressure_assessments(opportunity_id, assessed_at desc);
