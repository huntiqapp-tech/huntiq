-- HUNTIQ v0.9.110 customer authority evidence self-check
-- Prevents a customer-visible authority envelope from claiming evidence authority that the displayed evidence cannot independently support.

create table if not exists customer_authority_evidence_self_check_audit (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  data_state text not null,
  validation_state text not null,
  authority_envelope_present boolean not null default false,
  claimed_history_authoritative boolean not null default false,
  claimed_anomaly_authoritative boolean not null default false,
  claimed_market_comparison_authoritative boolean not null default false,
  claimed_profit_roi_authoritative boolean not null default false,
  claimed_notification_authoritative boolean not null default false,
  verified_history_count integer not null default 0,
  history_ready boolean not null default false,
  anomaly_confidence numeric not null default 0,
  reference_price numeric,
  verified_completed_sale_count integer not null default 0,
  resale_ready boolean not null default false,
  aggregate_comps_authoritative boolean not null default false,
  release_ready boolean not null default false,
  economics_ready boolean not null default false,
  conservative_profit numeric not null default 0,
  conservative_roi numeric not null default 0,
  readiness_alert_eligible boolean not null default false,
  customer_visible boolean not null default false,
  browser_alert_eligible boolean not null default false,
  check (verified_history_count >= 0),
  check (verified_completed_sale_count >= 0),
  check (not claimed_history_authoritative or (history_ready and verified_history_count >= 3)),
  check (not claimed_anomaly_authoritative or (claimed_history_authoritative and reference_price is not null and anomaly_confidence > 0)),
  check (not claimed_market_comparison_authoritative or (resale_ready and verified_completed_sale_count >= 3 and aggregate_comps_authoritative)),
  check (not claimed_profit_roi_authoritative or (release_ready and economics_ready and claimed_history_authoritative and claimed_market_comparison_authoritative and conservative_profit > 0 and conservative_roi > 0)),
  check (not claimed_notification_authoritative or (data_state = 'live' and readiness_alert_eligible and claimed_profit_roi_authoritative)),
  check (not customer_visible or data_state not in ('live','cached') or authority_envelope_present),
  check (not browser_alert_eligible or claimed_notification_authoritative)
);

create index if not exists customer_authority_evidence_self_check_audit_opportunity_idx
  on customer_authority_evidence_self_check_audit (opportunity_id, assessed_at desc);
