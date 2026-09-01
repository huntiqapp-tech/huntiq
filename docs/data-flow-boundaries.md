# HUNTIQ data-flow boundaries

Updated: 2026-09-01

## Purpose
HUNTIQ must keep source observations, derived history, resale evidence, economics, scoring, and customer alerts separate enough that every recommendation can be audited and uncertain data cannot masquerade as fact.

## Production flow
1. **Retailer observation ingestion** — normalize retailer, store/location, product identity, observed price, fulfillment/inventory state, source, and observation timestamp. Never blend store-local price observations into a national history series.
2. **Price-history persistence** — retain lawful observations according to the source's retention/license rules. `db/013_price_history_features.sql` derives sequential store/product history features such as previous price, prior-12 min/max/average, percentage drops, and preliminary markdown signals.
3. **Anomaly layer** — compare the current observation with its own location-specific history and supporting price consensus. An anomaly is a model conclusion, not a raw retailer fact; preserve the evidence and freshness that produced it.
4. **Resale evidence** — completed-sale comparables go to the strict sold-history path (`db/011_resale_comparables.sql`, `lib/resale-history.js`). Active/asking listings may inform liquidity and market competition but must never be represented as completed sales.
5. **Channel economics** — compute marketplace fees, shipping, taxes/costs, holding/return assumptions, risk-adjusted profit and ROI, plus downside economics based on the preferred completed-sale window's P25 price.
6. **Capital velocity** — estimate days-to-sell, sell-through, profit/ROI per 30 days, liquidity band, and capital-efficiency score. The customer feed uses this to prefer faster capital turns among otherwise-qualified deals.
7. **Evidence gate** — suppress alerts when price history, anomaly confidence, resale evidence, freshness, downside economics, or liquidity is insufficient.
8. **Alert delivery state** — `lib/alert-dedupe.js` and `db/014_alert_delivery_state.sql` prevent unchanged opportunities from generating repeated notifications while allowing material price/profit improvements through the cooldown.
9. **Customer presentation** — the PWA may simplify the output into HUNTIQ Score / BUY-WAIT-SKIP / profit / ROI / confidence, but it must not silently erase source freshness, blockers, or demo-vs-live provenance.

## Hard boundaries
- Affiliate payout is monetization metadata and must not affect opportunity ranking.
- Asking prices are not sold comps.
- Inventory counts are observations with confidence/freshness, not guarantees.
- Store-specific prices remain store-specific in anomaly baselines.
- Demo fixtures remain explicitly demo-only until replaced by rights-cleared production data.
- Retention and redistribution rules belong to the source adapter; HUNTIQ must not assume every API permits permanent historical storage.
- User-contributed scans require clear consent/provenance and should be distinguishable from retailer/provider observations.

## Audit keys to preserve
For each final recommendation retain enough information to recover: product identity, retailer/location, source and observed-at timestamp, price-history feature snapshot, anomaly score/evidence, resale comparable window/count/confidence, selected channel economics, downside result, velocity/liquidity result, evidence blockers/warnings, recommendation, alert eligibility, and alert-delivery reason.
