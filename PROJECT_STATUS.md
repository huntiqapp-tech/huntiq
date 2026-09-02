# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-02. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.32**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- v0.9.26 resale windows use match/source-quality-weighted `effectiveCount`; short windows must clear effective-evidence and confidence thresholds.
- v0.9.29 IQR sold-price integrity filters extreme completed-sale outliers before valuation while preserving raw evidence.
- v0.9.31 completed-sale freshness tracks newest/median sale age and prevents stale comps from creating current-looking urgency.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics and integrated evaluator in `lib/opportunity-evaluator.js`.
- v0.9.26 confidence-adjusted resale-price profit/ROI stress testing.
- v0.9.27 acquisition economics separates sticker price, checkout discounts/credits, tax, cash paid today and deferred retailer value.
- v0.9.28 promotion qualification validates membership, coupon, minimum-spend, date, item/channel and stacking requirements before promotional value is used.
- Capital-velocity engine estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- `lib/history-anomaly.js` computes store-local baseline, MAD volatility, sample/span strength, freshness, drop size and robust deviation.
- v0.9.30 history-cadence coverage measures unique observations, median gap, maximum gap and density versus expected cadence.
- **v0.9.32 source reliability:** `lib/source-reliability.js` scores provenance using evidence quality, verification, direct/official origin, freshness, identity match, conflicts and retention/redistribution metadata. It can cap anomaly/comparable confidence and apply a reliability haircut to profit/ROI.
- **v0.9.32 strict PWA path:** `lib/pwa-opportunity.js` now caps anomaly confidence and completed-sale source confidence by source reliability, exposes source-adjusted economics, downgrades instant alerts for mixed reliability, and suppresses weak-source opportunities.
- PWA explainability copy now calls out provenance reliability, and the offline cache is **`huntiq-public-v49`**.
- `db/013_price_history_features.sql` derives store-isolated sequential price-history features.
- `db/016_price_anomaly_assessments.sql` persists store-local anomaly/history evidence.
- `db/017_acquisition_economics.sql` persists checkout cost and deferred-credit economics separately.
- `db/018_promotion_eligibility.sql` persists promotion qualification separately from raw store price history.
- `db/019_resale_price_integrity.sql` persists robust completed-sale integrity evidence without rewriting raw comparable evidence.
- `db/020_history_coverage_assessments.sql` persists cadence/density/gap quality.
- `db/021_resale_freshness_assessments.sql` persists evaluator-level completed-sale recency evidence.
- **`db/022_source_reliability_assessments.sql`** persists source-quality audit snapshots without mutating raw observations.
- Alert deduplication/cooldown prevents repeated unchanged alerts while allowing material price/profit improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.
- Automated tests cover ingestion, history, anomalies, economics, resale, evaluator, evidence, alerts, matching and retailer-observation rights. v0.9.32 adds source-reliability regression coverage.

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: active asking/product evidence only; not completed-sale history. Marketplace Insights is restricted/not open to new users.
- Walmart Marketplace Item Search: UPC/GTIN/ASIN seller-catalog matching; not unrestricted consumer local-price/inventory.
- Best Buy: official developer API exposes pricing, availability, stores/store-aware availability and Open Box data; production requires developer key/terms.
- Lowe's: official Developer Hub describes partner product catalog, store-aware pricing, promotions, inventory and availability; production requires onboarding/credentials/agreements.
- Home Depot / Staples / Ace / Target monetization and data routes researched with affiliate payout kept separate from ranking.
- Menards: official API Developer Portal exists and production access requires prior authorization. Its 11% Rebate Credit Check is future store value, not an instant cash-price reduction.
- Kohl's / Harbor Freight / CVS / Walgreens public terms reinforce conditional-promotion and deferred-credit modeling.
- Tractor Supply: affiliate route exists; Smart Supply and bulk discounts are shopper/order-specific economics, not general shelf-price history.
- Costco and Sam's Club: warehouse/club, online and delivery-channel economics must remain separate; membership and conditional savings cannot rewrite raw price history.
- **BJ's Wholesale Club (v0.9.32):** same-day delivery fees vary by location/order conditions, digital coupons require clipping/application, Club+ 2% rewards are deferred value, and pickup/delivery fees are channel economics rather than shelf-price history. See `docs/bjs-wholesale-retailer-fit-2026-09-02.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- History cadence gaps and clustered observations reduce confidence.
- Completed-sale evidence must be recent enough to justify current resale economics.
- Source reliability must constrain, never inflate, anomaly/resale confidence; weak or conflicting provenance cannot create urgent alerts.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Demo fixtures remain visibly demo-only.
- Source-specific retention/redistribution terms control what HUNTIQ may persist historically.
- A source being technically ingestible does not imply HUNTIQ may persist or redistribute it.
- Rebates/store credits are not cash-price reductions unless applied at checkout.
- Primary ROI uses actual cash/capital outlay; deferred credits are separate expected value.
- Unconfirmed promotion eligibility never receives optimistic economics.
- Raw completed-sale evidence remains immutable even when evaluator-level filtering/scoring excludes or downweights evidence.

## NEXT — HIGH PRIORITY
- Push source-reliability assessment deeper into authorized retailer adapters and the central evidence gate rather than only the strict PWA bridge.
- Surface source reliability, resale integrity/freshness, cash outlay, promotion qualification and source-adjusted ROI explicitly in deal details.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator, promotion, history coverage, resale-integrity/freshness, source-reliability and alert-delivery snapshots once backend storage is connected.
- Expand marketplace-specific fee/profit/ROI fixtures and retailer-specific promotion/rebate modeling, especially quantity thresholds and multi-buy allocation.
- Add cloud accounts/watchlists and actual notification delivery after backend/account architecture is selected.

## EXTERNAL BLOCKERS / USER ACTION ONLY WHEN REQUIRED
- eBay production calls require developer credentials/application token; affiliate routing additionally requires partner-network setup.
- Best Buy production integration requires developer key and acceptance of API terms.
- Lowe's production integration requires partner onboarding, credentials and applicable agreements.
- Menards production API requires prior authorization.
- Monetized retailer routing requires relevant program application/acceptance and review of controlling terms.
- A legitimate completed-sale data source must be selected/authorized before demo sold history can be replaced.
- Private credentials/backend secrets must never be committed to this public repository.

## AGENT ASSIGNMENTS
No active parallel assignment recorded.

## HANDOFF
Continue from **v0.9.32**. Read `AGENTS.md`, this file, `README.md`, and `docs/data-flow-boundaries.md` before architecture changes.
