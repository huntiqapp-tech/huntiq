-- HUNTIQ v0.9.106 customer-live evidence authority audit
-- Stores the customer boundary's final authority flags without changing frozen model weights.

create table if not exists customer_live_authority_summary (
  id bigserial primary key,
  opportunity_id text not null,
  assessed_at timestamptz not null default now(),
  data_state text not null,
  verified_history_count integer not null default 0 check (verified_history_count >= 0),
  verified_completed_sale_count integer not null default 0 check (verified_completed_sale_count >= 0),
  history_authoritative boolean not null default false,
  anomaly_authoritative boolean not null default false,
  market_comparison_authoritative boolean not null default false,
  profit_roi_authoritative boolean not null default false,
  notification_authoritative boolean not null default false,
  authority_blockers jsonb not null default '[]'::jsonb,
  check (not history_authoritative or verified_history_count >= 3),
  check (not anomaly_authoritative or history_authoritative),
  check (not market_comparison_authoritative or verified_completed_sale_count >= 3),
  check (not profit_roi_authoritative or (history_authoritative and market_comparison_authoritative)),
  check (not notification_authoritative or (profit_roi_authoritative and data_state = 'live'))
);

create index if not exists customer_live_authority_summary_opportunity_idx
  on customer_live_authority_summary (opportunity_id, assessed_at desc);
