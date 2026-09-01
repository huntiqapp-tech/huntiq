-- HUNTIQ alert delivery audit / deduplication state
-- Keeps notification suppression decisions explainable and prevents unchanged alerts from spamming users.

create table if not exists alert_delivery_state (
  id integer primary key autoincrement,
  user_key text,
  opportunity_key text not null,
  fingerprint text not null,
  retailer text,
  store_id text,
  alert_level text not null,
  price numeric,
  risk_adjusted_profit numeric,
  risk_adjusted_roi numeric,
  sent_at text not null,
  reason text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_alert_delivery_fingerprint_sent
  on alert_delivery_state(fingerprint, sent_at desc);

create index if not exists idx_alert_delivery_opportunity_sent
  on alert_delivery_state(opportunity_key, sent_at desc);

create index if not exists idx_alert_delivery_user_sent
  on alert_delivery_state(user_key, sent_at desc);
