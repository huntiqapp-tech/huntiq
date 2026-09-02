# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-02. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.36**
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
- v0.9.35 basket-aware promotion allocation: `lib/basket-promotions.js` requires a confirmed full basket, validates the order threshold, excludes ineligible lines, and allocates a basket reward by each eligible line's proportional qualified spend.
- **v0.9.36 multi-buy promotion engine:** `lib/multibuy-promotions.js` models buy-X-get-Y, cheapest-item-free and quantity-tier offers. It expands eligible quantities into units, applies free-item value to the cheapest qualifying units, and returns zero optimistic savings when the full quantity/basket is unconfirmed.
- **v0.9.36 acquisition/ROI integration:** verified multi-buy savings lower checkout acquisition outlay only by the current item's attributable discount; channel profit/ROI therefore use the verified quantity economics while raw observed price history remains unchanged.
- **v0.9.36 alert integration:** multi-buy uncertainty is folded into the combined promotion status already consumed by the evidence gate, preventing instant alerts from unconfirmed quantity savings.
- Capital-velocity engine estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- `lib/history-anomaly.js` computes store-local baseline, MAD volatility, sample/span strength, freshness, drop size and robust deviation.
- v0.9.30 history-cadence coverage measures unique observations, median gap, maximum gap and density versus expected cadence.
- v0.9.32 source reliability scores provenance using evidence quality, verification, direct/official origin, freshness, identity match, conflicts and retention/redistribution metadata.
- v0.9.33 independent source chains: retailer provenance caps history/anomaly confidence while resale provenance independently caps completed-sale source confidence; the weaker chain constrains source-adjusted economics and alert confidence.
- v0.9.34 decision-floor economics: the central evaluator calculates source-adjusted headline, downside and confidence-adjusted profit/ROI and exposes the minimum credible result as `decisionFloorProfit` / `decisionFloorRoi`.
- Offline cache is **`huntiq-public-v53`** and includes basket and multi-buy promotion engines.
- `db/013_price_history_features.sql` derives store-isolated sequential price-history features.
- `db/016_price_anomaly_assessments.sql` persists store-local anomaly/history evidence.
- `db/017_acquisition_economics.sql` persists checkout cost and deferred-credit economics separately.
- `db/018_promotion_eligibility.sql` persists promotion qualification separately from raw store price history.
- `db/019_resale_price_integrity.sql` persists robust completed-sale integrity evidence without rewriting raw comparable evidence.
- `db/020_history_coverage_assessments.sql` persists cadence/density/gap quality.
- `db/021_resale_freshness_assessments.sql` persists evaluator-level completed-sale recency evidence.
- `db/022_source_reliability_assessments.sql` persists source-quality audit snapshots without mutating raw observations.
- `db/023_evaluator_source_chain.sql` persists independent retailer/resale source-chain results.
- `db/024_decision_floor_economics.sql` persists derived source-adjusted headline/downside/confidence economics plus the final decision floor.
- `db/025_basket_promotion_allocations.sql` persists basket qualification and per-SKU reward allocations separately from raw retailer price history.
- **`db/026_multibuy_promotion_evaluations.sql`** persists quantity-rule eligibility, attributable discounts and effective unit acquisition costs separately from raw store price observations.
- Alert deduplication/cooldown prevents repeated unchanged alerts while allowing material price/profit improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.
- Automated tests cover ingestion, history, anomalies, economics, resale, evaluator, evidence, alerts, matching and retailer-observation rights. v0.9.36 adds `tests/multibuy-promotions.test.js` for B2G1, cheapest-item-free, quantity tiers, incomplete quantities, acquisition outlay, profit/ROI and alert downgrade behavior.

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
- BJ's Wholesale Club: same-day delivery fees vary by location/order conditions, digital coupons require clipping/application, Club+ rewards are deferred value, and pickup/delivery fees are channel economics rather than shelf-price history.
- Micro Center: store-specific stock, reservation evidence, separate new/open-box/clearance histories and account-qualified Member Pricing rules documented.
- Northern Tool + Equipment: order-threshold e-gift cards are deferred basket-level value; military discounts are shopper-specific.
- Dollar General: myDG Delivery and third-party delivery channels require separate channel economics; DG Cash Back is deferred value; affiliate permission does not grant price-history persistence rights.
- **Office Depot / OfficeMax (v0.9.36):** Rewards Member Price requires membership/sign-in; coupons/free-gift offers do not simply stack with Member Price; 2%/Bonus Rewards are deferred value; some bonus rewards require coupons; delivery thresholds/fees are channel economics. See `docs/office-depot-retailer-fit-2026-09-02.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- History cadence gaps and clustered observations reduce confidence.
- Completed-sale evidence must be recent enough to justify current resale economics.
- Retailer-price provenance and resale-sale provenance are separate trust chains; one score must never be blindly reused for both.
- Source reliability must constrain, never inflate, anomaly/resale confidence.
- Alert urgency is constrained by the worst credible source-adjusted ROI scenario.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Demo fixtures remain visibly demo-only.
- Source-specific retention/redistribution terms control what HUNTIQ may persist historically.
- Rebates/store credits are not cash-price reductions unless applied at checkout.
- Primary ROI uses actual cash/capital outlay; deferred credits are separate expected value.
- Basket/order-level rewards require a confirmed qualifying basket and must be allocated across eligible line spend before SKU-level economics use them.
- **Multi-buy savings require the full qualifying quantity. Unconfirmed quantities receive zero promotional value and cannot create instant-alert urgency.**
- **Quantity promotions alter acquisition economics only; they must never rewrite the raw single-unit observed price used by store-local anomaly history.**
- Unconfirmed promotion eligibility never receives optimistic economics.
- Raw completed-sale evidence remains immutable even when evaluator-level filtering/scoring excludes or downweights evidence.

## NEXT — HIGH PRIORITY
- Add customer deal-detail rows that explicitly show required purchase quantity, multi-buy discount and effective acquisition cost per unit when a real promotion is present.
- Extend multi-buy modeling to mixed-SKU category offers and maximum-redemption limits while preserving cheapest-unit allocation.
- Push source-reliability metadata into each rights-cleared retailer adapter as those integrations become available.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator, promotion, history coverage, resale-integrity/freshness, source-chain, decision-floor and alert-delivery snapshots once backend storage is connected.
- Expand marketplace-specific fee/profit/ROI fixtures and retailer-specific promotion/rebate modeling.
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
Continue from **v0.9.36**. Read `AGENTS.md`, this file, `README.md`, and `docs/data-flow-boundaries.md` before architecture changes.
