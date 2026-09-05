-- HUNTIQ v0.9.108 customer PWA authority gate
-- Audits the final browser visibility boundary so a PWA cannot re-promote evidence that the customer authority layer withheld.

create table if not exists customer_pwa_authority_gate_audit (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  history_authoritative boolean not null default false,
  anomaly_authoritative boolean not null default false,
  market_comparison_authoritative boolean not null default false,
  profit_roi_authoritative boolean not null default false,
  notification_authoritative boolean not null default false,
  customer_visible boolean not null default false,
  browser_alert_eligible boolean not null default false,
  data_state text not null default 'validation',
  check (not customer_visible or (history_authoritative and anomaly_authoritative and market_comparison_authoritative and profit_roi_authoritative and notification_authoritative)),
  check (not browser_alert_eligible or notification_authoritative),
  check (not browser_alert_eligible or data_state = 'live'),
  check (not notification_authoritative or profit_roi_authoritative),
  check (not profit_roi_authoritative or (history_authoritative and market_comparison_authoritative))
);

create index if not exists customer_pwa_authority_gate_audit_opportunity_idx
  on customer_pwa_authority_gate_audit (opportunity_id, assessed_at desc);
