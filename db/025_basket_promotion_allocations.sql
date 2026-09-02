-- HUNTIQ v0.9.35
-- Derived basket-promotion allocation snapshots. Raw retailer prices remain immutable.
create table if not exists basket_promotion_allocations (
  id bigint generated always as identity primary key,
  retailer_key text not null,
  location_key text,
  basket_id text not null,
  promotion_key text,
  product_key text not null,
  assessed_at timestamptz not null default now(),
  basket_complete boolean not null default false,
  threshold_amount numeric(12,2) not null default 0,
  qualifying_spend numeric(12,2) not null default 0,
  requested_reward numeric(12,2) not null default 0,
  reward_type text not null default 'future-credit',
  allocation_method text not null default 'proportional-qualified-spend',
  allocated_reward numeric(12,2) not null default 0,
  allocation_share numeric(8,6) not null default 0,
  status text not null check (status in ('eligible','unknown','ineligible')),
  reasons jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  constraint basket_promotion_allocation_nonnegative check (
    threshold_amount >= 0 and qualifying_spend >= 0 and requested_reward >= 0 and allocated_reward >= 0 and allocation_share >= 0
  ),
  constraint basket_promotion_allocation_share check (allocation_share <= 1),
  constraint basket_promotion_allocation_not_over_reward check (allocated_reward <= requested_reward)
);
create index if not exists basket_promotion_allocations_lookup_idx on basket_promotion_allocations (retailer_key, location_key, product_key, assessed_at desc);
create index if not exists basket_promotion_allocations_basket_idx on basket_promotion_allocations (basket_id, assessed_at desc);
comment on table basket_promotion_allocations is 'Derived audit snapshots for basket-level promotion qualification and per-SKU allocation. Never use this table as raw shelf-price history.';
