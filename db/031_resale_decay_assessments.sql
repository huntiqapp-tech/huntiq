create table if not exists resale_decay_assessments (
  id integer primary key,
  opportunity_id text not null,
  evaluated_at text not null,
  market_value real not null,
  purchase_quantity integer not null,
  trend_30_vs_90_pct real,
  observed_decline_pct real not null default 0,
  monthly_decay_pct real not null default 0,
  price_30d real not null,
  price_60d real not null,
  price_90d real not null,
  weighted_sale_price real not null,
  weighted_decay_pct real not null,
  unsold_90d_pct real not null,
  decay_score integer not null,
  blocker_codes text not null default '[]',
  warning_codes text not null default '[]'
);
create index if not exists idx_resale_decay_opportunity_time on resale_decay_assessments(opportunity_id,evaluated_at desc);
-- Derived stress snapshots only. Never overwrite raw completed-sale evidence or retailer price observations.