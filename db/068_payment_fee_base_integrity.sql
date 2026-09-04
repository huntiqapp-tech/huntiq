-- HUNTIQ v0.9.93: payment processing fees may use a different transaction base than marketplace commission.
alter table if exists pwa_marketplace_economics
  add column if not exists payment_fee_base numeric(12,2),
  add column if not exists payment_fee_on_shipping boolean,
  add column if not exists payment_fee_on_sales_tax boolean;

create table if not exists payment_fee_base_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  sale_price numeric(12,2) not null check (sale_price >= 0),
  buyer_shipping_revenue numeric(12,2) not null default 0 check (buyer_shipping_revenue >= 0),
  buyer_sales_tax numeric(12,2) not null default 0 check (buyer_sales_tax >= 0),
  marketplace_fee_base numeric(12,2) not null check (marketplace_fee_base >= 0),
  marketplace_fee_on_shipping boolean not null,
  marketplace_fee_on_sales_tax boolean not null,
  payment_fee_base numeric(12,2) not null check (payment_fee_base >= 0),
  payment_fee_on_shipping boolean not null,
  payment_fee_on_sales_tax boolean not null,
  payment_fee_pct numeric(7,4) not null default 0 check (payment_fee_pct >= 0),
  payment_fixed_fee numeric(12,2) not null default 0 check (payment_fixed_fee >= 0),
  payment_fee numeric(12,2) not null default 0 check (payment_fee >= 0),
  net_profit numeric(12,2) not null,
  roi_pct numeric(9,2) not null,
  urgent_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (marketplace_fee_base = sale_price + case when marketplace_fee_on_shipping then buyer_shipping_revenue else 0 end + case when marketplace_fee_on_sales_tax then buyer_sales_tax else 0 end),
  check (payment_fee_base = sale_price + case when payment_fee_on_shipping then buyer_shipping_revenue else 0 end + case when payment_fee_on_sales_tax then buyer_sales_tax else 0 end)
);

comment on table payment_fee_base_audit is 'Audits separate marketplace-commission and payment-processing fee bases so shipping/tax treatment cannot silently distort HUNTIQ profit, ROI, or alerts.';
