-- HUNTIQ v0.9.94: stale timestamped price history cannot retain urgent anomaly confidence.
create table if not exists stale_history_confidence_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  newest_history_at timestamptz not null,
  history_age_days numeric(10,2) not null check (history_age_days >= 0),
  raw_anomaly_confidence integer not null check (raw_anomaly_confidence between 0 and 99),
  stale_confidence_cap integer not null check (stale_confidence_cap between 0 and 99),
  final_anomaly_confidence integer not null check (final_anomaly_confidence between 0 and 99),
  anomaly_label text not null,
  urgent_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (final_anomaly_confidence <= stale_confidence_cap),
  check ((history_age_days <= 14 and stale_confidence_cap = 99)
      or (history_age_days > 14 and history_age_days <= 30 and stale_confidence_cap <= 85)
      or (history_age_days > 30 and history_age_days <= 60 and stale_confidence_cap <= 69)
      or (history_age_days > 60 and history_age_days <= 90 and stale_confidence_cap <= 54)
      or (history_age_days > 90 and stale_confidence_cap <= 39))
);
create index if not exists stale_history_confidence_age_idx on stale_history_confidence_audit(history_age_days desc, evaluated_at desc);
comment on table stale_history_confidence_audit is 'Audits freshness caps so old price-history baselines remain context but cannot independently manufacture urgent anomaly confidence or alerts.';