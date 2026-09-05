-- Customer-live evidence authority audit.
-- Aggregate resale comparisons and anomaly reference prices are customer-facing evidence,
-- so they must not survive when the verified evidence needed to authorize them is absent.

create table if not exists customer_live_evidence_authority_audit (
  audit_id bigserial primary key,
  opportunity_id text not null,
  verified_history_count integer not null default 0 check (verified_history_count >= 0),
  promoted_history_count integer not null default 0 check (promoted_history_count >= 0),
  history_ready boolean not null default false,
  anomaly_reference_price numeric,
  anomaly_confidence numeric not null default 0 check (anomaly_confidence >= 0 and anomaly_confidence <= 100),
  verified_completed_sale_count integer not null default 0 check (verified_completed_sale_count >= 0),
  resale_ready boolean not null default false,
  aggregate_resale_comps_authoritative boolean not null default false,
  d30_resale_price numeric,
  d60_resale_price numeric,
  d90_resale_price numeric,
  conservative_profit numeric not null default 0,
  conservative_roi numeric not null default 0,
  customer_alert_eligible boolean not null default false,
  evaluated_at timestamptz not null default now(),
  check (not history_ready or (verified_history_count >= 3 and promoted_history_count >= 3)),
  check (history_ready or (anomaly_reference_price is null and anomaly_confidence = 0)),
  check (not aggregate_resale_comps_authoritative or (resale_ready and verified_completed_sale_count >= 3)),
  check (aggregate_resale_comps_authoritative or (d30_resale_price is null and d60_resale_price is null and d90_resale_price is null)),
  check ((history_ready and resale_ready) or (conservative_profit = 0 and conservative_roi = 0 and customer_alert_eligible = false))
);
