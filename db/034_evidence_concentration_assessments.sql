-- HUNTIQ v0.9.43 — derived temporal concentration audit layer.
-- Raw retailer observations and raw sold comparables remain immutable.
create table if not exists evidence_concentration_assessments (
  id bigserial primary key,
  opportunity_id text,
  evidence_kind text not null check (evidence_kind in ('retailer','resale')),
  assessed_at timestamptz not null default now(),
  sample_count integer not null default 0,
  unique_days integer not null default 0,
  max_day_share_pct numeric(6,2) not null default 0,
  concentration_score integer not null default 0,
  concentration_band text,
  warnings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_evidence_concentration_opportunity on evidence_concentration_assessments(opportunity_id, assessed_at desc);
create index if not exists idx_evidence_concentration_kind on evidence_concentration_assessments(evidence_kind, assessed_at desc);