# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-01. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.30**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- v0.9.26 resale windows use match/source-quality-weighted `effectiveCount`; a short window must have enough effective evidence and confidence before becoming the market-value window.
- v0.9.29 robust sold-price integrity applies IQR-based extreme-price filtering before median/P25/P75 economics are calculated; raw evidence remains immutable.
- v0.9.29 alert protection makes resale price integrity part of the evidence gate.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics and integrated evaluator in `lib/opportunity-evaluator.js`.
- v0.9.26 evaluator adds confidence-adjusted resale-price profit/ROI stress testing.
- v0.9.27 acquisition economics separates sticker price, checkout discounts/credits, tax, cash paid today and deferred retailer value.
- v0.9.28 promotion qualification validates membership, coupon, minimum-spend, date, item/channel and stacking requirements before promotional value is used.
- v0.9.28 promotion-safe alerts prevent unconfirmed member/coupon pricing from creating instant urgency.
- Capital-velocity engine estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score; feed ranking prefers faster capital turns.
- `lib/history-anomaly.js` computes store-local history baseline, MAD volatility, sample/span strength, freshness, drop size and robust deviation.
- **v0.9.30 price-history cadence coverage:** history anomaly scoring now measures unique observation count, median gap, maximum gap and density versus expected cadence. Large missing-data gaps reduce anomaly confidence instead of allowing a technically long but sparse history to masquerade as strong evidence.
- **v0.9.30 alert gating:** `historyCoverageScore` is passed through the strict PWA evaluator. Coverage below 35 is a blocker, coverage below 70 warns as `gappy-price-history`, and coverage below 85 prevents `instant` urgency.
- **v0.9.30 PWA explainability:** deal cards/details now expose history-coverage percentage, unique/sample count, median gap, max gap and history label.
- PWA offline service-worker cache is **`huntiq-public-v47`**.
- `db/013_price_history_features.sql` derives store-isolated sequential price-history features.
- `db/016_price_anomaly_assessments.sql` persists store-local anomaly/history evidence.
- `db/017_acquisition_economics.sql` persists checkout cost and deferred-credit economics separately.
- `db/018_promotion_eligibility.sql` persists promotion qualification separately from raw store price history.
- `db/019_resale_price_integrity.sql` persists robust completed-sale integrity evidence without rewriting raw comparable evidence.
- **`db/020_history_coverage_assessments.sql`** persists cadence/density/gap quality for each retailer + product + location assessment without mutating raw observations.
- Alert deduplication/cooldown engine prevents repeated unchanged alerts while allowing material price or profit improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.
- Automated tests cover ingestion, history, anomaly lifecycle, economics, resale, evaluator, evidence, alerts, matching and retailer observation rights. **v0.9.30 expands history-anomaly and evidence-gate regression coverage for regular, duplicate, gappy and severely incomplete histories.**

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: active asking/product evidence only; not completed-sale history. Marketplace Insights is restricted/not open to new users.
- Walmart Marketplace Item Search: UPC/GTIN/ASIN seller-catalog matching; not evidence of unrestricted consumer local-price/inventory.
- Best Buy: official developer API exposes pricing, availability, stores/store-aware availability and Open Box data; production requires developer key/terms and retention limits matter.
- Lowe's: official Developer Hub describes partner product catalog, store-aware pricing, promotions, inventory and availability; production requires onboarding/credentials/agreements.
- Home Depot / Staples / Ace / Target monetization and data routes researched with affiliate payout kept separate from ranking.
- Menards: official API Developer Portal exists and production access requires prior authorization. Its 11% Rebate Credit Check is future store value, not an instant cash-price reduction.
- Kohl's / Harbor Freight / CVS / Walgreens public terms reinforce conditional-promotion and deferred-credit modeling.
- Tractor Supply: affiliate route exists; Smart Supply and bulk discounts are shopper/order-specific economics, not general shelf-price history.
- **Costco (v0.9.30):** official public pages reinforce that warehouse, online and SameDay pricing/selection can differ; membership, quantity/date limits and channel identity must be modeled separately. Executive rewards are deferred value rather than checkout discounts. No unrestricted public local warehouse price/inventory developer API was identified in the official public material reviewed. See `docs/costco-retailer-fit-2026-09-01.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- A long timespan is not automatically strong price history; cadence gaps and duplicate/clustered observations reduce confidence.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Demo fixtures remain visibly demo-only.
- Source-specific retention/redistribution terms control what HUNTIQ may persist historically.
- Hunter/user scan observations preserve consent, provenance and verification separately from retailer/provider observations.
- A source being technically ingestible does not imply HUNTIQ may persist or redistribute it.
- Rebates/store credits are not equivalent to cash price reductions unless actually applied at checkout.
- Primary ROI uses actual cash/capital outlay; deferred credits are separately identified expected value.
- Unconfirmed promotion eligibility never receives optimistic economics.
- Raw completed-sale evidence remains immutable even when evaluator-level robust filtering excludes statistical outliers from valuation.

## NEXT — HIGH PRIORITY
- Integrate retailer observation contract and history-anomaly/cadence assessment directly into each authorized production source adapter.
- Surface strict resale integrity, cash outlay, promotion qualification, deferred credit and confidence-adjusted economics even more explicitly in customer deal details.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator, promotion qualification, history coverage, resale-integrity and alert-delivery snapshots once backend storage is connected.
- Expand marketplace-specific fee/profit/ROI fixtures and retailer-specific promotion/rebate modeling, especially quantity thresholds and multi-buy allocation.
- Add cloud accounts/watchlists and actual notification delivery after backend/account architecture is selected.

## EXTERNAL BLOCKERS / USER ACTION ONLY WHEN REQUIRED
- eBay production calls require developer credentials/application token; affiliate routing additionally requires partner-network setup.
- Best Buy production integration requires developer key and acceptance of API terms.
- Lowe's production integration requires partner onboarding, credentials and applicable agreements.
- Menards production API requires prior authorization.
- Ace/Home Depot/Staples/Target/Tractor Supply monetized routing requires relevant program application/acceptance and review of controlling terms.
- A legitimate completed-sale data source must be selected/authorized before demo sold history can be replaced.
- Private credentials/backend secrets must never be committed to this public repository.

## AGENT ASSIGNMENTS
No active parallel assignment recorded.

## HANDOFF
Continue from **v0.9.30**. Read `AGENTS.md`, this file, `README.md`, and `docs/data-flow-boundaries.md` before architecture changes.
