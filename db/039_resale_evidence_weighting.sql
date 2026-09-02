-- HUNTIQ v0.9.49 — derived time-decayed resale evidence assessment.
-- Raw completed-sale records remain immutable.
create table if not exists resale_evidence_weighting_assessments (
  id bigserial primary key,
  opportunity_id text,
  assessed_at timestamptz not null default now(),
  sample_count integer not null default 0,
  effective_weight numeric(10,3) not null default 0,
  recent_30_weight_share_pct numeric(7,2) not null default 0,
  weighted_median numeric(12,2),
  weighted_p25 numeric(12,2),
  weighted_mean numeric(12,2),
  half_life_days numeric(8,2) not null default 45,
  evidence_score integer not null default 0,
  evidence_band text,
  future_count integer not null default 0,
  adjusted_profit numeric(12,2),
  adjusted_roi numeric(9,2),
  adjusted_alert_level text,
  alert_eligible boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb
);
create index if not exists resale_evidence_weighting_opportunity_idx on resale_evidence_weighting_assessments(opportunity_id,assessed_at desc);