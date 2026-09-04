# HUNTIQ v0.9.89 build handoff

Date: 2026-09-04

## Change
Customer-live resale evidence is now fail-closed on stable product identity. Completed-sale rows with missing or mismatched product identity are excluded before resale readiness, conservative profit/ROI authority, and alert eligibility are calculated.

Precomputed comp summaries (`d30`, `d60`, `d90`, sold-window depth, active listing count and current asks) are exposed only when the comp bundle itself carries the same stable product identity as the current opportunity. This prevents a wrong-SKU aggregate from surviving even when raw completed-sale rows are filtered.

## Why this matters
A cross-product upstream batch could otherwise attach high-value sold comps from a different SKU to a cheaper retail observation. That could falsely strengthen resale confidence and downstream profit/ROI or alerts. v0.9.89 closes that live customer boundary.

## Database
`db/064_live_resale_identity_integrity.sql` adds an audit boundary for supplied/accepted completed sales, identity/status/duplicate rejections, comp identity match, resale readiness, conservative economics and alert eligibility.

## Tests
`tests/customer-live-payload.test.js` now covers:
- accepted product-bound completed sales;
- wrong-product and identity-less sold-row rejection;
- sold-depth recomputation from accepted rows only;
- wrong-product precomputed comp quarantine;
- conservative profit/ROI fail-closed behavior after resale contamination;
- alert suppression after resale contamination;
- validated Bright Data/Home Depot sales carrying explicit product identity.

## Retailer research
`docs/macys-retailer-fit-2026-09-04.md` documents Macy's online/store/clearance channel isolation, reference-price semantics, pickup readiness, shipping/delivery landed-cost treatment and Star Money as deferred value.

## Active priority
Continue live-data-first integration. Do not add speculative risk/scoring layers unless real provider output demonstrates a specific uncovered gap. An authenticated production provider run still requires the applicable runtime credential and confirmed retention/redistribution rights.
