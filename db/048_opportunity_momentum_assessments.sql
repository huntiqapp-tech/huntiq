create table if not exists opportunity_momentum_assessments (
  id integer primary key,
  opportunity_id text not null,
  assessed_at text not null,
  price_episode_confirmations integer not null default 0,
  price_episode_persistence_days real not null default 0,
  resale_recent_median real,
  resale_prior_median real,
  resale_trend_pct real,
  anomaly_multiplier real not null,
  economics_multiplier real not null,
  adjusted_anomaly_score integer not null,
  adjusted_anomaly_confidence integer not null,
  momentum_adjusted_profit real,
  momentum_adjusted_roi real,
  momentum_score integer not null,
  alert_eligible integer not null default 0,
  blockers_json text not null default '[]',
  cautions_json text not null default '[]',
  method text not null
);
create index if not exists idx_opportunity_momentum_opportunity_time on opportunity_momentum_assessments(opportunity_id, assessed_at desc);