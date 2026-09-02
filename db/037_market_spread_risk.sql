-- HUNTIQ v0.9.46
-- Persists derived price-regime stability and market-spread risk assessments.
-- Raw retailer observations and completed-sale evidence remain immutable.

create table if not exists price_regime_stability_assessments (
  id integer primary key,
  opportunity_id text not null,
  evaluated_at text not null,
  sample_count integer not null default 0,
  baseline_price real,
  recent_median_price real,
  regime_shift_pct real,
  retailer_mad_pct real,
  regime_stability_score integer,
  anomaly_confidence integer,
  anomaly_label text,
  unique_observation_count integer,
  duplicate_observation_count integer not null default 0,
  future_observation_count integer not null default 0
);

create table if not exists market_spread_risk_assessments (
  id integer primary key,
  opportunity_id text not null,
  evaluated_at text not null,
  purchase_quantity integer not null default 1,
  market_value real,
  resale_dispersion_pct real,
  retailer_mad_pct real,
  retailer_regime_stability_score integer,
  resale_confidence integer,
  risk_index real,
  spread_score integer,
  spread_band text,
  haircut_pct real,
  conservative_sale_price real,
  spread_adjusted_profit real,
  spread_adjusted_roi real,
  decision_floor_profit real,
  decision_floor_roi real,
  alert_level text,
  alert_eligible integer not null default 0,
  blockers_json text not null default '[]',
  warnings_json text not null default '[]'
);

create index if not exists idx_price_regime_stability_opportunity
  on price_regime_stability_assessments(opportunity_id, evaluated_at desc);

create index if not exists idx_market_spread_risk_opportunity
  on market_spread_risk_assessments(opportunity_id, evaluated_at desc);

create index if not exists idx_market_spread_risk_alert
  on market_spread_risk_assessments(alert_eligible, spread_score, decision_floor_roi, evaluated_at desc);