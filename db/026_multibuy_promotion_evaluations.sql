-- HUNTIQ v0.9.36
-- Derived audit records for quantity-based promotions. Raw retailer observations remain immutable.

create table if not exists multibuy_promotion_evaluations (
  id integer primary key,
  evaluation_id text not null,
  retailer_id text,
  location_id text,
  product_id text,
  observed_at text,
  promotion_type text not null,
  basket_complete integer not null default 0,
  required_quantity integer,
  buy_quantity integer,
  get_quantity integer,
  discount_percent real,
  discount_per_unit real,
  eligible_unit_count integer not null default 0,
  total_discount real not null default 0,
  current_item_discount real not null default 0,
  current_item_spend real not null default 0,
  current_item_effective_cost real not null default 0,
  current_item_effective_unit_cost real not null default 0,
  promotion_status text not null,
  reasons_json text not null default '[]',
  warnings_json text not null default '[]',
  created_at text not null default (datetime('now'))
);

create index if not exists idx_multibuy_eval_product_location
  on multibuy_promotion_evaluations(retailer_id, product_id, location_id, observed_at);

create index if not exists idx_multibuy_eval_status
  on multibuy_promotion_evaluations(promotion_status, created_at);
