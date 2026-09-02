-- HUNTIQ v0.9.34
-- Derived evaluator snapshot: conservative decision-floor economics.
-- Raw retailer observations and raw completed-sale evidence remain immutable.

create table if not exists decision_floor_economics (
  id bigserial primary key,
  opportunity_key text not null,
  evaluated_at timestamptz not null default now(),
  retailer_source_score numeric(5,2),
  resale_source_score numeric(5,2),
  combined_source_score numeric(5,2),
  risk_adjusted_profit numeric(12,2),
  risk_adjusted_roi numeric(8,2),
  source_adjusted_profit numeric(12,2),
  source_adjusted_roi numeric(8,2),
  source_adjusted_downside_profit numeric(12,2),
  source_adjusted_downside_roi numeric(8,2),
  source_adjusted_confidence_profit numeric(12,2),
  source_adjusted_confidence_roi numeric(8,2),
  decision_floor_profit numeric(12,2) not null,
  decision_floor_roi numeric(8,2) not null,
  decision_floor_basis text not null default 'minimum-of-risk-downside-confidence-source-adjusted',
  alert_level text,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb
);

create index if not exists decision_floor_economics_opportunity_time_idx
  on decision_floor_economics (opportunity_key, evaluated_at desc);
