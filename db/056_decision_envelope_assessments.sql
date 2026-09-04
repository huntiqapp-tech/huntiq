create table if not exists decision_envelope_assessments (
  id integer primary key,
  retailer text not null,
  sku text not null,
  store_id text,
  observed_at text not null,
  anomaly_confidence real,
  resale_confidence real,
  evidence_confidence real,
  liquidity_score real,
  execution_confidence real,
  agreement_floor real,
  uncertainty_haircut_pct real,
  conservative_profit real,
  conservative_roi real,
  downside_profit real,
  downside_roi real,
  blocked integer not null default 0,
  verdict text not null,
  alert_action text not null,
  reasons_json text not null default '[]',
  created_at text not null default current_timestamp
);
create index if not exists idx_decision_envelope_lookup on decision_envelope_assessments(retailer,sku,store_id,observed_at);
