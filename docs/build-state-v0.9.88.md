# HUNTIQ v0.9.88 build handoff

Date: 2026-09-04

## Change
Customer-live price-history rows are now fail-closed on stable product identity in addition to the existing timestamp, retailer, store/location, channel and provider checks.

A row with a missing product identity or a product identity that differs from the current observation is excluded before price-history/anomaly evaluation. Accepted live-history rows retain the stable identity in the customer payload. If exclusions leave insufficient history, live readiness falls back to shadow quarantine and alerts remain disabled.

This prevents cross-product provider/batch contamination from increasing anomaly confidence or making profit/ROI/alert decisions look better than the evidence supports.

## Database
`db/063_live_history_identity_integrity.sql` adds an audit boundary for accepted observations and identity/provider/location/time/duplicate rejection classes.

## Tests
`tests/customer-live-payload.test.js` now covers:
- accepted product-bound history;
- missing live history timestamps;
- channel/current-time contamination;
- wrong-product history rows;
- identity-less history rows;
- fail-closed alert readiness after product contamination;
- validated Bright Data/Home Depot history with explicit product identity.

## Retailer research
`docs/lowes-retailer-fit-refresh-2026-09-04.md` refreshes Lowe's public Price Promise, store/ZIP isolation, pickup and delivery modeling rules.

## Active priority
Continue live-data-first work. Do not add another speculative scoring model unless real provider output demonstrates an uncovered safety gap. Authenticated provider calls still require runtime credentials and rights validation; no secret is stored in this repository.