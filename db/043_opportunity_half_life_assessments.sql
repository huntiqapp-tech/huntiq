create table if not exists opportunity_half_life_assessments (
  id integer primary key,
  opportunity_id text,
  retailer text,
  sku text,
  assessed_at text not null default current_timestamp,
  data_state text not null,
  retail_age_minutes real not null,
  resale_age_days real not null,
  retail_half_life_minutes real not null,
  resale_half_life_days real not null,
  retail_decay real not null,
  resale_decay real not null,
  cross_domain_multiplier real not null,
  adjusted_anomaly_confidence integer not null,
  adjusted_resale_confidence integer not null,
  adjusted_profit real not null,
  adjusted_roi_pct real not null,
  alert_state text not null,
  alert_eligible integer not null,
  warnings_json text not null default '[]',
  blockers_json text not null default '[]'
);
create index if not exists idx_opportunity_half_life_opportunity on opportunity_half_life_assessments(opportunity_id, assessed_at);
create index if not exists idx_opportunity_half_life_alert on opportunity_half_life_assessments(alert_eligible, alert_state, assessed_at);