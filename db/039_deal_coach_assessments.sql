-- HUNTIQ v0.9.59
-- Persist the evidence snapshot used to explain a customer-facing recommendation.
-- This table stores derived assessment values only; raw retailer history and sold comps remain in their source tables.
create table if not exists deal_coach_assessments (
  id bigserial primary key,
  opportunity_id text not null,
  retailer text not null,
  sku text not null,
  store_id text not null default 'online',
  assessed_at timestamptz not null,
  data_state text not null,
  verdict text not null check (verdict in ('BUY','WATCH','SKIP')),
  anomaly_drop_pct numeric,
  anomaly_confidence numeric,
  history_coverage_score numeric,
  resale_confidence numeric,
  sold_count integer,
  liquidity_score numeric,
  base_profit numeric,
  base_roi numeric,
  downside_roi numeric,
  risk_adjusted_profit numeric,
  max_buy_price numeric,
  current_price numeric,
  alert_priority text,
  alert_eligible boolean not null default false,
  explanation_basis text not null default 'deterministic-evaluator-evidence',
  reasons jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (opportunity_id, assessed_at)
);
create index if not exists idx_deal_coach_lookup on deal_coach_assessments(retailer, sku, store_id, assessed_at desc);
create index if not exists idx_deal_coach_verdict on deal_coach_assessments(verdict, assessed_at desc);
comment on table deal_coach_assessments is 'Derived explainability audit linking price-history/anomaly/resale/economics/alert evidence to a HUNTIQ recommendation.';