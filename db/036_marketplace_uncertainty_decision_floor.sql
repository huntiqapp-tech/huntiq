-- HUNTIQ v0.9.45
-- Audits how marketplace cost uncertainty participates in the final conservative decision floor.
-- Derived evaluation data only; never mutates raw retailer observations or completed-sale evidence.

create table if not exists marketplace_uncertainty_decision_floor (
  id integer primary key,
  opportunity_id text not null,
  evaluated_at text not null,
  marketplace text,
  marketplace_late_sale_profit real,
  marketplace_late_sale_roi real,
  uncertainty_cost real not null default 0,
  uncertainty_score integer,
  uncertainty_profit real,
  uncertainty_roi real,
  decision_floor_profit real,
  decision_floor_roi real,
  decision_floor_basis text not null,
  alert_level text,
  alert_eligible integer not null default 0,
  blockers_json text not null default '[]',
  warnings_json text not null default '[]',
  assumptions_json text not null default '{}'
);

create index if not exists idx_marketplace_uncertainty_floor_opportunity
  on marketplace_uncertainty_decision_floor(opportunity_id, evaluated_at desc);

create index if not exists idx_marketplace_uncertainty_floor_alert
  on marketplace_uncertainty_decision_floor(alert_eligible, decision_floor_roi, evaluated_at desc);