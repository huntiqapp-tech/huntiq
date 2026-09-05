-- HUNTIQ v0.9.103
-- Customer-live economics and alerts require explicit display-rights and retention provenance.

create table if not exists customer_live_rights_provenance_integrity (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  provider_record_id text,
  rights_class text,
  retention_policy text,
  redistribution_allowed boolean not null default false,
  history_ready boolean not null default false,
  resale_ready boolean not null default false,
  anomaly_confidence numeric(7,2),
  conservative_profit numeric(12,2),
  conservative_roi_pct numeric(9,2),
  customer_alert_eligible boolean not null default false,
  primary key (opportunity_id, evaluated_at),
  check (
    (provider_record_id is not null and btrim(provider_record_id) <> '' and
     rights_class is not null and btrim(rights_class) <> '' and
     retention_policy is not null and btrim(retention_policy) <> '' and
     redistribution_allowed = true)
    or
    (history_ready = false and resale_ready = false and
     coalesce(anomaly_confidence, 0) = 0 and
     coalesce(conservative_profit, 0) = 0 and
     coalesce(conservative_roi_pct, 0) = 0 and
     customer_alert_eligible = false)
  )
);

create index if not exists customer_live_rights_provenance_integrity_opportunity_idx
  on customer_live_rights_provenance_integrity(opportunity_id, evaluated_at desc);

comment on table customer_live_rights_provenance_integrity is
  'Audit boundary proving missing customer display-rights or retention provenance cannot authorize price-history/anomaly readiness, resale readiness, conservative profit/ROI, or alerts.';
