-- HUNTIQ v0.9.98
-- Completed-sale depth without dated sold evidence cannot authorize customer resale economics.

create table if not exists comp_economics_freshness_audit (
  opportunity_id text not null,
  evaluated_at timestamptz not null default now(),
  accepted_sold_count integer not null check (accepted_sold_count >= 0),
  dated_sold_count integer not null check (dated_sold_count >= 0),
  freshness_known boolean not null,
  comp_confidence numeric(6,2) not null check (comp_confidence between 0 and 100),
  comp_trust numeric(6,3) not null check (comp_trust between 0 and 1),
  raw_profit numeric(12,2),
  raw_roi_pct numeric(9,2),
  comp_adjusted_profit numeric(12,2),
  comp_adjusted_roi_pct numeric(9,2),
  economics_authoritative boolean not null,
  primary key (opportunity_id, evaluated_at),
  check (dated_sold_count <= accepted_sold_count),
  check (freshness_known = (dated_sold_count > 0)),
  check (economics_authoritative = freshness_known),
  check (freshness_known or comp_trust = 0),
  check (freshness_known or coalesce(comp_adjusted_profit, 0) = 0),
  check (freshness_known or coalesce(comp_adjusted_roi_pct, 0) = 0)
);

create index if not exists comp_economics_freshness_audit_opportunity_idx
  on comp_economics_freshness_audit(opportunity_id, evaluated_at desc);

comment on table comp_economics_freshness_audit is
  'Audit boundary ensuring undated completed-sale comps may remain diagnostic evidence but cannot retain adjusted profit/ROI authority.';