-- HUNTIQ v0.9.28
-- Persist promotion qualification separately from observed retailer price and acquisition economics.
-- This prevents member-only/coupon/expired offers from silently rewriting store-local price history.

create table if not exists promotion_eligibility_assessments (
  id integer primary key,
  opportunity_key text not null,
  retailer_key text,
  store_key text,
  product_key text,
  observed_at text,
  evaluated_at text not null,
  promotion_status text not null check (promotion_status in ('eligible','unknown','ineligible')),
  membership_required integer not null default 0,
  member_eligible integer,
  coupon_required integer not null default 0,
  coupon_applied integer,
  minimum_spend numeric,
  starts_at text,
  expires_at text,
  channel_restricted integer not null default 0,
  channel_eligible integer,
  item_restricted integer not null default 0,
  item_eligible integer,
  stackable integer,
  single_use integer not null default 0,
  requested_instant_discount numeric not null default 0,
  requested_checkout_credit numeric not null default 0,
  requested_future_credit numeric not null default 0,
  applied_instant_discount numeric not null default 0,
  applied_checkout_credit numeric not null default 0,
  applied_future_credit numeric not null default 0,
  reasons_json text not null default '[]',
  warnings_json text not null default '[]'
);

create index if not exists idx_promotion_eligibility_opportunity_time
  on promotion_eligibility_assessments(opportunity_key, evaluated_at desc);

create index if not exists idx_promotion_eligibility_store_product_time
  on promotion_eligibility_assessments(retailer_key, store_key, product_key, evaluated_at desc);

-- Promotion evidence is intentionally separate from price-history observations.
-- A member/coupon offer may affect checkout economics only when its eligibility is known and valid.
