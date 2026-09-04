create table if not exists market_reality_assessments (
  id bigserial primary key,
  opportunity_id text,
  retailer text not null,
  sku text,
  store_id text,
  channel text,
  acquisition_price numeric(12,2) not null,
  verified_sold_market_value numeric(12,2),
  market_value_basis text,
  market_spread numeric(12,2),
  market_edge_pct numeric(9,2),
  retailer_reference_price numeric(12,2),
  retailer_reference_price_type text,
  reference_discount_pct numeric(9,2),
  reference_price_excluded_from_history boolean not null default true,
  reference_price_authoritative boolean not null default false,
  recommendation text,
  alert_eligible boolean not null default false,
  assessed_at timestamptz not null default now(),
  check (acquisition_price >= 0),
  check (verified_sold_market_value is null or verified_sold_market_value >= 0),
  check (reference_price_excluded_from_history = true),
  check (reference_price_authoritative = false)
);

create index if not exists market_reality_assessments_lookup_idx
  on market_reality_assessments(retailer, sku, store_id, channel, assessed_at desc);

comment on table market_reality_assessments is
  'Audit boundary between verified completed-sale market value and retailer reference/MSRP context. Reference prices are never price-history/anomaly evidence or resale authority.';
