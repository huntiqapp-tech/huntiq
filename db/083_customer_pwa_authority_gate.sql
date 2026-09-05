-- HUNTIQ v0.9.108 customer PWA authority gate
-- Audits the final browser visibility boundary so a PWA cannot re-promote evidence that the customer authority layer withheld.
--
-- PERSISTENCE STATUS: schema-only, like every other table in this db/ directory as of
-- v0.9.109 (see docs/data-flow-boundaries.md, "Schema persistence status"). This repository
-- has no database client or writer of any kind; the JS in lib/ computes the same authority
-- flags this table's columns describe (lib/pwa-data-state.js resolveCustomerDataState(),
-- lib/customer-evidence-authority.js) and enforces them in-process, but nothing currently
-- inserts rows here. Treat this table as the intended audit-trail *contract* for a future
-- service-layer writer, not as an active log -- do not build alerting, reporting, or
-- compliance checks against it until a writer exists and is documented.

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
