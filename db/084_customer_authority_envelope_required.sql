-- HUNTIQ v0.9.109 required customer authority envelope
-- Prevents validated live/cached customer rows from bypassing the evidence-authority boundary by omitting the envelope entirely.

create table if not exists customer_authority_envelope_audit (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  data_state text not null,
  validation_state text not null,
  authority_envelope_present boolean not null default false,
  history_authoritative boolean not null default false,
  anomaly_authoritative boolean not null default false,
  market_comparison_authoritative boolean not null default false,
  profit_roi_authoritative boolean not null default false,
  notification_authoritative boolean not null default false,
  customer_visible boolean not null default false,
  browser_alert_eligible boolean not null default false,
  check (data_state in ('live','cached','delayed','demo','validation')),
  check (not (data_state in ('live','cached') and validation_state = 'validated') or authority_envelope_present),
  check (not customer_visible or data_state not in ('live','cached') or authority_envelope_present),
  check (not browser_alert_eligible or authority_envelope_present),
  check (not browser_alert_eligible or notification_authoritative),
  check (not notification_authoritative or profit_roi_authoritative),
  check (not profit_roi_authoritative or (history_authoritative and anomaly_authoritative and market_comparison_authoritative))
);

create index if not exists customer_authority_envelope_audit_opportunity_idx
  on customer_authority_envelope_audit (opportunity_id, assessed_at desc);
