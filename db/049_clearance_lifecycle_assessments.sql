create table if not exists clearance_lifecycle_assessments (
  id bigserial primary key,
  opportunity_key text not null,
  retailer text not null,
  product_key text not null,
  location_key text,
  channel text,
  stage text not null check (stage in ('fresh-markdown','established-markdown','normalized-low-price','terminal-clearance')),
  retailer_clearance boolean not null default false,
  terminal_signal boolean not null default false,
  persistence_days numeric(10,2),
  confirmations integer,
  adjusted_anomaly_score numeric(10,2),
  adjusted_anomaly_confidence numeric(10,2),
  resale_multiplier numeric(10,4),
  lifecycle_adjusted_resale numeric(12,2),
  lifecycle_adjusted_profit numeric(12,2),
  lifecycle_adjusted_roi numeric(10,2),
  alert_eligible boolean not null,
  alert_priority text not null,
  blockers jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  assessed_at timestamptz not null default now()
);

create index if not exists clearance_lifecycle_lookup_idx
  on clearance_lifecycle_assessments (retailer, product_key, location_key, channel, assessed_at desc);
