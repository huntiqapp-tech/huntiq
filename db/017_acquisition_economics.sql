-- HUNTIQ v0.9.27 acquisition economics
-- Keep immediate checkout cost separate from future rebates/store credits.

create table if not exists acquisition_economic_snapshots (
  id integer primary key autoincrement,
  retailer_key text not null,
  product_key text not null,
  location_key text not null,
  observed_at text not null,
  sticker_price numeric not null check (sticker_price >= 0),
  instant_discount numeric not null default 0 check (instant_discount >= 0),
  checkout_credit numeric not null default 0 check (checkout_credit >= 0),
  checkout_price numeric not null check (checkout_price >= 0),
  purchase_tax numeric not null default 0 check (purchase_tax >= 0),
  cash_outlay numeric not null check (cash_outlay >= 0),
  future_credit numeric not null default 0 check (future_credit >= 0),
  future_credit_type text,
  realization_rate numeric not null default 0 check (realization_rate >= 0 and realization_rate <= 1),
  days_to_credit numeric not null default 0 check (days_to_credit >= 0),
  annual_discount_rate numeric not null default 0 check (annual_discount_rate >= 0 and annual_discount_rate <= 1),
  expected_future_credit numeric not null default 0 check (expected_future_credit >= 0),
  economic_acquisition_cost numeric not null check (economic_acquisition_cost >= 0),
  source_key text,
  created_at text not null default current_timestamp
);

create index if not exists idx_acquisition_economics_identity_time
  on acquisition_economic_snapshots(retailer_key, product_key, location_key, observed_at desc);

create index if not exists idx_acquisition_economics_deferred_value
  on acquisition_economic_snapshots(future_credit_type, observed_at desc)
  where future_credit > 0;
