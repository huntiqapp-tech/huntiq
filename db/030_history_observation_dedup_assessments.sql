-- HUNTIQ v0.9.39: derived duplicate-observation audit snapshots.
-- Raw observations remain immutable; this records what the anomaly evaluator excluded.
create table if not exists history_observation_dedup_assessments (
  id integer primary key,
  retailer text not null,
  store_id text not null,
  product_key text not null,
  evaluated_at text not null,
  raw_observation_count integer not null default 0,
  unique_timestamp_count integer not null default 0,
  duplicate_observation_count integer not null default 0,
  excluded_promotion_observation_count integer not null default 0,
  baseline_price real,
  anomaly_confidence integer not null default 0,
  history_coverage_score integer not null default 0
);
create index if not exists idx_history_dedup_product_store_time on history_observation_dedup_assessments(retailer,store_id,product_key,evaluated_at desc);