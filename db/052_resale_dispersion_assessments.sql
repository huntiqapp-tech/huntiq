create table if not exists resale_dispersion_assessments (
  id integer primary key,
  product_key text not null,
  assessed_at text not null,
  sample_size integer not null,
  median_sold_price numeric,
  q1_sold_price numeric,
  q3_sold_price numeric,
  iqr numeric,
  robust_spread numeric,
  dispersion_status text not null,
  dispersion_score numeric not null,
  haircut_pct numeric not null,
  adjusted_resale numeric,
  adjusted_profit numeric,
  adjusted_roi numeric,
  alert_action text not null,
  blocked integer not null default 0,
  reason text
);
create index if not exists idx_resale_dispersion_product_time on resale_dispersion_assessments(product_key, assessed_at desc);