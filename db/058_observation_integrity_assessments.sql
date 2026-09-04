create table if not exists observation_integrity_assessments (
  id bigserial primary key,
  opportunity_id text,
  retailer text,
  sku text,
  store_id text,
  zip text,
  channel text,
  condition text,
  price_scope text,
  fulfillment text,
  exact_count integer not null default 0,
  total_count integer not null default 0,
  contamination_count integer not null default 0,
  ambiguous_count integer not null default 0,
  contamination_ratio numeric(8,5) not null default 0,
  ambiguity_ratio numeric(8,5) not null default 0,
  integrity_score numeric(6,2) not null default 0,
  adjusted_anomaly_confidence numeric(6,2) not null default 0,
  adjusted_resale_confidence numeric(6,2) not null default 0,
  conservative_profit numeric(12,2) not null default 0,
  conservative_roi numeric(9,2) not null default 0,
  alert_eligible boolean not null default false,
  alert_action text not null default 'suppressed',
  blockers jsonb not null default '[]'::jsonb,
  assessed_at timestamptz not null default now()
);

create index if not exists observation_integrity_lookup_idx
  on observation_integrity_assessments(retailer,sku,store_id,channel,assessed_at desc);
