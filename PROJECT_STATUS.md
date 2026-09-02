# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-02. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.39**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.
- Offline cache: **`huntiq-public-v56`**.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- 30/60/90 resale windows use match/source-quality-weighted effective evidence, IQR outlier filtering, resale freshness and source reliability.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics, confidence-adjusted resale economics and source-adjusted decision-floor economics are integrated in `lib/opportunity-evaluator.js`.
- Acquisition economics separates sticker price, qualified checkout discounts, tax, cash paid today and deferred retailer value.
- Promotion qualification covers membership, coupons, minimum spend, date, channel, stacking, basket rewards, multi-buy rules, redemption caps and mix-and-match restrictions.
- Store-local anomaly scoring uses median baseline, MAD volatility, sample/span strength, freshness, cadence coverage and source reliability.
- Promotion-adjusted/effective-unit prices are excluded from raw shelf-price anomaly history.
- **v0.9.39 duplicate-history protection:** exact duplicate observation timestamps are collapsed before anomaly baseline/sample scoring; the median same-timestamp price is retained and `duplicateObservationCount` is exposed for audit. Repeated snapshots therefore cannot manufacture anomaly sample strength.
- Capital velocity estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- **v0.9.38 multi-unit exposure:** purchase quantity is checked against 30/90-day completed-sale depth and can downgrade or suppress deals whose required quantity is unsupported by observed demand.
- **v0.9.39 partial-liquidation economics:** `lib/partial-liquidation.js` models expected units sold, remaining units, acquisition capital released/tied up and expected realized profit at 30/60/90 days. High 90-day capital lockup constrains evidence score, downgrades Instant alerts and can suppress severely unsupported multi-unit deals.
- PWA strict deal details surface source reliability, resale integrity/freshness, source-adjusted economics, decision floor, promotion terms and 30/60/90 capital-release exposure.
- Alert dedupe/cooldown prevents repeated unchanged alerts while allowing material improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.

## DATABASE / AUDIT LAYERS
- `db/013_price_history_features.sql` — store-isolated sequential price features.
- `db/016_price_anomaly_assessments.sql` — store-local anomaly/history evidence.
- `db/017_acquisition_economics.sql` — checkout cost and deferred-credit economics.
- `db/018_promotion_eligibility.sql` — promotion qualification.
- `db/019_resale_price_integrity.sql` — completed-sale integrity evidence.
- `db/020_history_coverage_assessments.sql` — cadence/density/gap quality.
- `db/021_resale_freshness_assessments.sql` — completed-sale recency.
- `db/022_source_reliability_assessments.sql` — source-quality snapshots.
- `db/023_evaluator_source_chain.sql` — independent retailer/resale trust chains.
- `db/024_decision_floor_economics.sql` — source-adjusted downside/confidence floor.
- `db/025_basket_promotion_allocations.sql` — basket reward allocation.
- `db/026_multibuy_promotion_evaluations.sql` — quantity promotion economics.
- `db/027_promotion_redemption_limits.sql` — redemption caps and offer groups.
- `db/028_multi_unit_resale_exposure.sql` — purchase-quantity resale exposure.
- **`db/029_partial_liquidation_economics.sql`** — 30/60/90 units sold, remaining units, capital tied up and realized-profit snapshots.
- **`db/030_history_observation_dedup_assessments.sql`** — raw versus unique timestamp counts and duplicate exclusions used by anomaly scoring.

## TESTING
- Automated tests cover ingestion, price history, anomalies, economics, resale, evaluator, evidence, alerts, matching, retailer-observation rights and promotion logic.
- v0.9.38 added `tests/unit-exposure.test.js`.
- **v0.9.39 adds `tests/partial-liquidation.test.js` and duplicate timestamp regression coverage in `tests/history-anomaly.test.js`.**

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: active asking/product evidence only; not completed-sale history. Marketplace Insights remains restricted.
- Best Buy and Lowe's official developer routes researched; production use requires credentials/terms/onboarding.
- Home Depot, Staples, Ace, Target, Menards, Kohl's, Harbor Freight, CVS, Walgreens, Tractor Supply, Costco, Sam's Club, BJ's, Micro Center, Northern Tool, Dollar General, Office Depot/OfficeMax, PetSmart and Petco public retailer/promotion rules documented.
- **AutoZone (v0.9.39):** Rewards are deferred account value after qualifying purchases, same-day store pickup is subject to availability until order-ready confirmation, and online Ship-to-Home coupons are channel/threshold/item-qualified acquisition economics rather than raw shelf-price history. No unrestricted official public local price/inventory API was established. See `docs/autozone-retailer-fit-2026-09-02.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- Duplicate observation timestamps cannot increase anomaly sample strength.
- History cadence gaps and clustered observations reduce confidence.
- Completed-sale evidence must be recent and reliable enough to justify current resale economics.
- Retailer-price provenance and resale-sale provenance are separate trust chains.
- Source reliability constrains, never inflates, anomaly/resale confidence.
- Alert urgency is constrained by the worst credible source-adjusted ROI scenario and multi-unit capital exposure.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Source-specific retention/redistribution terms control persistence.
- Rebates/store credits are not cash-price reductions unless applied at checkout.
- Primary ROI uses actual cash outlay; deferred value is separate.
- Promotion-adjusted effective cost never becomes raw shelf-price history.
- Multi-unit opportunities must account for how much capital remains tied up after 30/60/90 days.
- Raw completed-sale evidence remains immutable even when evaluator-level filtering/downweighting excludes it.

## NEXT — HIGH PRIORITY
- Add explicit unknown-redemption-limit state when public terms say uses may be limited but do not expose the cap.
- Add partial-liquidation downside scenarios that haircut later units if resale prices weaken while inventory is being cleared.
- Push source-reliability metadata into each rights-cleared retailer adapter as integrations become available.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator/history/promotion/resale/source/alert snapshots once backend storage is connected.
- Expand marketplace-specific fee fixtures and actual notification delivery after backend/account architecture is selected.
