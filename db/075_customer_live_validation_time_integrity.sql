-- HUNTIQ v0.9.100
-- Customer-live provider evidence must be observed, retrieved, validated, and decided in chronological order.

create table if not exists customer_live_validation_time_integrity (
  id bigserial primary key,
  provider text not null,
  provider_record_id text not null,
  retailer text not null,
  product_identity text not null,
  observed_at timestamptz not null,
  retrieved_at timestamptz not null,
  validated_at timestamptz not null,
  decision_as_of timestamptz not null,
  authenticated_lookup_passed boolean not null default false,
  manual_source_check_passed boolean not null default false,
  customer_display_allowed boolean not null default false,
  chronology_valid boolean generated always as (
    observed_at <= retrieved_at
    and retrieved_at <= validated_at
    and validated_at <= decision_as_of
  ) stored,
  customer_alert_eligible boolean not null default false,
  rejection_reason text,
  created_at timestamptz not null default now(),
  constraint customer_live_validation_time_order check (
    observed_at <= retrieved_at
    and retrieved_at <= validated_at
    and validated_at <= decision_as_of
  ),
  constraint customer_live_validation_alert_requires_current_validation check (
    customer_alert_eligible = false
    or (
      authenticated_lookup_passed = true
      and manual_source_check_passed = true
      and customer_display_allowed = true
      and observed_at <= retrieved_at
      and retrieved_at <= validated_at
      and validated_at <= decision_as_of
    )
  )
);

create index if not exists customer_live_validation_time_integrity_provider_record_idx
  on customer_live_validation_time_integrity (provider, provider_record_id, decision_as_of desc);

comment on table customer_live_validation_time_integrity is
  'Audit boundary proving that a customer-live retailer observation was retrieved before validation and validated before the customer decision/alert time.';
