create table if not exists source_reliability_assessments (
  id integer primary key generated always as identity,
  retailer text not null,
  product_key text not null,
  location_key text,
  assessed_at timestamptz not null default now(),
  observation_count integer not null default 0,
  verified_count integer not null default 0,
  direct_count integer not null default 0,
  persistent_count integer not null default 0,
  redistributable_count integer not null default 0,
  conflict_count integer not null default 0,
  reliability_score numeric(5,2) not null,
  reliability_band text not null,
  notes jsonb not null default '{}'::jsonb,
  constraint source_reliability_score_range check (reliability_score between 0 and 100)
);
create index if not exists source_reliability_lookup_idx on source_reliability_assessments(retailer, product_key, location_key, assessed_at desc);
comment on table source_reliability_assessments is 'Audit layer for source quality. Raw price observations remain immutable; this table records how much trust an evaluation placed in their provenance, verification, freshness, identity match and rights metadata.';