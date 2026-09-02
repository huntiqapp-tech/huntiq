-- HUNTIQ v0.9.42
-- Derived audit snapshots for promotions whose redemption limit is not published.
-- Never use these rows as raw shelf-price observations.

create table if not exists unknown_promotion_limit_assessments (
  id integer primary key,
  retailer text not null,
  location_id text,
  product_id text,
  promotion_type text not null,
  available_redemptions integer not null default 0,
  guaranteed_redemptions integer not null default 0,
  uncertain_redemptions integer not null default 0,
  redemption_limit_known integer not null default 0,
  explicit_redemption_limit integer,
  guaranteed_discount_cents integer not null default 0,
  excluded_uncertain_discount_cents integer not null default 0,
  promotion_status text not null check (promotion_status in ('eligible','unknown','ineligible')),
  alert_eligible integer not null default 0,
  reasons_json text not null default '[]',
  warnings_json text not null default '[]',
  observed_at text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_unknown_promo_limit_lookup
  on unknown_promotion_limit_assessments(retailer, location_id, product_id, observed_at desc);
