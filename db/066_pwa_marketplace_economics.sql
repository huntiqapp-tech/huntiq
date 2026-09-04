-- HUNTIQ v0.9.91: customer-facing marketplace economics integrity
create table if not exists pwa_marketplace_economics (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  sale_price numeric(12,2) not null check (sale_price >= 0),
  buyer_shipping_revenue numeric(12,2) not null default 0 check (buyer_shipping_revenue >= 0),
  buyer_sales_tax numeric(12,2) not null default 0 check (buyer_sales_tax >= 0),
  gross_seller_revenue numeric(12,2) not null check (gross_seller_revenue >= 0),
  marketplace_fee_pct numeric(7,4) not null check (marketplace_fee_pct between 0 and 60),
  marketplace_fee_on_shipping boolean not null default true,
  marketplace_fee_on_sales_tax boolean not null default false,
  marketplace_fee_base numeric(12,2) not null check (marketplace_fee_base >= 0),
  marketplace_fee numeric(12,2) not null check (marketplace_fee >= 0),
  acquisition_cost numeric(12,2) not null check (acquisition_cost >= 0),
  net_profit numeric(12,2) not null,
  roi_pct numeric(9,2) not null,
  evidence_adjusted_profit numeric(12,2),
  evidence_adjusted_roi_pct numeric(9,2),
  alert_state text not null check (alert_state in ('instant','standard','digest')),
  urgent_alert_eligible boolean not null,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  primary key (opportunity_id, evaluated_at),
  check (gross_seller_revenue = sale_price + buyer_shipping_revenue),
  check (marketplace_fee_base = sale_price + case when marketplace_fee_on_shipping then buyer_shipping_revenue else 0 end + case when marketplace_fee_on_sales_tax then buyer_sales_tax else 0 end)
);
create index if not exists pwa_marketplace_economics_opportunity_idx on pwa_marketplace_economics(opportunity_id, evaluated_at desc);
comment on table pwa_marketplace_economics is 'Audits the venue-aware fee base and profit/ROI shown to customers and used to gate alerts.';