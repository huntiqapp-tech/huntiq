-- HUNTIQ v0.9.99
-- Audit the temporal boundary used before live evidence can reach customer decisions.

create table if not exists customer_live_evidence_integrity_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  retail_observed_at timestamptz not null,
  customer_as_of timestamptz not null,
  accepted_history_count integer not null check (accepted_history_count >= 0),
  accepted_completed_sale_count integer not null check (accepted_completed_sale_count >= 0),
  rejected_future_history_count integer not null check (rejected_future_history_count >= 0),
  rejected_future_completed_sale_count integer not null check (rejected_future_completed_sale_count >= 0),
  latest_accepted_history_at timestamptz,
  latest_accepted_completed_sale_at timestamptz,
  customer_alert_eligible boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (latest_accepted_history_at is null or latest_accepted_history_at < retail_observed_at),
  check (latest_accepted_completed_sale_at is null or latest_accepted_completed_sale_at < least(retail_observed_at, customer_as_of))
);

create index if not exists customer_live_evidence_integrity_audit_opportunity_idx
  on customer_live_evidence_integrity_audit(opportunity_id, evaluated_at desc);

comment on table customer_live_evidence_integrity_audit is
  'Provider/customer boundary audit proving that price history and completed-sale evidence accepted by the public PWA predate the retail observation/as-of decision boundary.';
