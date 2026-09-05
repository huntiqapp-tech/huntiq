# HUNTIQ v0.9.97 build notes

## Completed in this release

- Resale comparable freshness now requires timestamped **completed-sale** evidence. `lib/comp-quality.js` emits `freshnessKnown=false` and `freshnessScore=0` when accepted sold comps have no usable sale timestamp; dated asking listings cannot establish sold-market freshness.
- The PWA final alert bridge now treats an explicit comp-quality assessment with zero dated sold comps as temporally incomplete, records `resaleFreshnessSource`, removes customer profit/ROI authority, caps priority at verification/digest level, and adds `undated-resale-comp-freshness`.
- `db/072_resale_freshness_provenance_integrity.sql` makes the same rule auditable and prevents undated sold depth from retaining temporal trust or urgent-alert eligibility.
- `tests/resale-freshness-provenance.test.js` covers undated sold comps, recent timestamped sold comps, PWA temporal completeness, profit/ROI authority, and alert suppression.
- PWA service-worker cache advanced to `huntiq-public-v97`.
- Walgreens public retailer rules refreshed in `docs/walgreens-retailer-fit-2026-09-04.md`; online/store price separation, membership pricing, Walgreens Cash, conditional promotions, pickup readiness, and substitutions remain separate evidence/economics concepts.

## Product rule added

A count of completed-sale comps is not evidence that the resale market is current. Resale freshness authority requires at least one accepted completed-sale row with a usable timestamp. Undated sold comps may contribute identity/depth diagnostics, but they cannot authorize current-market profit/ROI confidence or urgent alerts.
