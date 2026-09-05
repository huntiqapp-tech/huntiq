# HUNTIQ v0.9.98 build notes

## Completed in this release

- Closed a resale-comparison economics gap: undated completed-sale comps can no longer retain a 35% minimum trust floor in `lib/comp-quality.js`.
- `adjustEconomics()` now sets `compTrust=0`, `compAdjustedProfit=0`, `compAdjustedRoi=0`, and `compEconomicsAuthoritative=false` whenever completed-sale freshness is not known from dated sold evidence.
- Existing dated sold comps still receive confidence-weighted adjusted economics.
- `tests/comp-freshness.test.js` now proves that undated sold depth remains diagnostic but cannot authorize profit/ROI, while fresh dated comps can.
- `db/073_comp_economics_freshness_authority.sql` enforces the same invariant at the audit layer.
- CVS public retailer rules were added, preserving store/channel separation and treating ExtraCare/ExtraBucks/coupons as conditional acquisition context rather than universal price history.
- PWA service-worker cache advanced to v98.

## Product rule added

A resale-comparison set without timestamped completed-sale evidence has zero customer economic authority. It may help identify a product or provide diagnostic depth, but it cannot support evidence-adjusted profit, ROI, or urgent-alert economics until current-market timing is proven.