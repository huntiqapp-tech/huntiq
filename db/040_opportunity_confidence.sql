create table if not exists opportunity_confidence_assessments (
  id integer primary key,
  opportunity_key text not null,
  assessed_at text not null,
  confidence_score integer not null check(confidence_score between 0 and 100),
  confidence_level text not null,
  anomaly_confidence real,
  history_coverage real,
  resale_confidence real,
  sold_depth_score real,
  liquidity_score real,
  economics_strength real,
  downside_strength real,
  weakest_component text,
  blockers_json text not null default '[]',
  cautions_json text not null default '[]',
  alert_eligible integer not null default 0,
  method text not null,
  created_at text not null default current_timestamp
);
create index if not exists idx_opportunity_confidence_key_time on opportunity_confidence_assessments(opportunity_key,assessed_at desc);