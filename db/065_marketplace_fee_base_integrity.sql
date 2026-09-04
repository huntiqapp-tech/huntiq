-- HUNTIQ marketplace fee-base integrity audit boundary
-- Buyer-paid shipping and tax can change the fee base without changing item sale price.
create table if not exists marketplace_fee_base_assessments (
  id integer primary key,
  opportunity_id text not null,
  marketplace text not null,
  assessed_at text not null,
  sale_price numeric not null check (sale_price >= 0),
  buyer_shipping_revenue numeric not null default 0 check (buyer_shipping_revenue >= 0),
  buyer_sales_tax numeric not null default 0 check (buyer_sales_tax >= 0),
  marketplace_fee_pct numeric not null default 0 check (marketplace_fee_pct >= 0 and marketplace_fee_pct <= 60),
  marketplace_fee_on_shipping integer not null default 1 check (marketplace_fee_on_shipping in (0,1)),
  marketplace_fee_on_sales_tax integer not null default 0 check (marketplace_fee_on_sales_tax in (0,1)),
  marketplace_fee_base numeric not null check (marketplace_fee_base >= 0),
  marketplace_fee numeric not null check (marketplace_fee >= 0),
  gross_seller_revenue numeric not null check (gross_seller_revenue >= 0),
  fulfillment_cost numeric not null default 0 check (fulfillment_cost >= 0),
  evidence_adjusted_profit numeric not null,
  evidence_adjusted_roi_pct numeric not null,
  eligible_for_urgent_alert integer not null check (eligible_for_urgent_alert in (0,1)),
  check (marketplace_fee_base >= sale_price),
  check (gross_seller_revenue = sale_price + buyer_shipping_revenue),
  check (marketplace_fee_on_shipping = 0 or marketplace_fee_base >= sale_price + buyer_shipping_revenue),
  check (marketplace_fee_on_sales_tax = 0 or marketplace_fee_base >= sale_price + buyer_sales_tax)
);

create index if not exists idx_marketplace_fee_base_assessments_opportunity
  on marketplace_fee_base_assessments(opportunity_id, assessed_at desc);
