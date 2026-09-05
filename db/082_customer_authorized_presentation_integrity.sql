-- HUNTIQ v0.9.107 customer-authorized presentation integrity
-- Audits the final PWA-safe projection after evidence authority has been evaluated.

create table if not exists customer_authorized_presentation_audit (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  anomaly_authoritative boolean not null default false,
  market_comparison_authoritative boolean not null default false,
  profit_roi_authoritative boolean not null default false,
  notification_authoritative boolean not null default false,
  presented_reference_price numeric,
  presented_market_d30 numeric,
  presented_market_d60 numeric,
  presented_market_d90 numeric,
  presented_profit numeric,
  presented_roi numeric,
  presented_alert_eligible boolean not null default false,
  check (anomaly_authoritative or presented_reference_price is null),
  check (market_comparison_authoritative or (presented_market_d30 is null and presented_market_d60 is null and presented_market_d90 is null)),
  check (profit_roi_authoritative or (presented_profit is null and presented_roi is null)),
  check (not presented_alert_eligible or notification_authoritative),
  check (not notification_authoritative or profit_roi_authoritative)
);

create index if not exists customer_authorized_presentation_audit_opportunity_idx
  on customer_authorized_presentation_audit (opportunity_id, assessed_at desc);
