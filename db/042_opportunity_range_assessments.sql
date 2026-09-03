create table if not exists opportunity_range_assessments (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  sold_count integer not null default 0,
  sold_p25 numeric,
  sold_median numeric,
  sold_p75 numeric,
  sold_dispersion_pct numeric,
  conservative_profit numeric,
  conservative_roi numeric,
  base_profit numeric,
  base_roi numeric,
  upside_profit numeric,
  upside_roi numeric,
  anomaly_drop_pct numeric,
  anomaly_confidence numeric,
  blockers jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  alert_eligible boolean not null default false,
  method text not null default 'sold-price-percentile-profit-range',
  evidence jsonb not null default '{}'::jsonb
);
create index if not exists opportunity_range_opportunity_time_idx on opportunity_range_assessments(opportunity_id, assessed_at desc);