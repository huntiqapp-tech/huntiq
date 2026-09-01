# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-01. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.27**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- v0.9.26 resale windows use match/source-quality-weighted `effectiveCount`; a short window must have enough effective evidence and confidence before becoming the market-value window.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics and integrated evaluator in `lib/opportunity-evaluator.js`.
- v0.9.26 evaluator adds a confidence-adjusted resale price and profit/ROI stress case derived from resale confidence; alerts can no longer rely only on the optimistic preferred median.
- **v0.9.27 acquisition economics:** `lib/acquisition-cost.js` separates sticker price, instant discounts/checkout credits, purchase tax, cash paid today, future rebate/store credit, realization rate, delay/time value, expected future credit and economic acquisition cost.
- **v0.9.27 cash-vs-economic ROI:** `lib/channel-economics.js` keeps primary ROI/risk-adjusted ROI anchored to actual capital outlay while exposing economic ROI separately; future credits may improve expected profit but cannot masquerade as a lower checkout price.
- Evidence gate suppresses weak/stale/unsafe opportunities; v0.9.26 blocks weak history baselines and negative confidence-adjusted ROI, while thin confidence-adjusted margins become warnings.
- **v0.9.27 alert rule:** opportunities whose positive profit depends on a deferred retailer credit get `deferred-credit-dependent` and cannot generate an `instant` alert; they are capped at `standard` even when the other evidence is strong.
- Capital-velocity engine estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- Customer feed incorporates capital efficiency; otherwise-equivalent fast-turn deals outrank slow flips, slow markets are capped and illiquid markets get zero feed priority.
- `lib/history-anomaly.js` (v0.9.26) computes store-local history baseline, MAD volatility, sample/span strength, freshness, drop size, robust z-like deviation and a history-derived anomaly confidence from actual price series.
- PWA strict evaluator consumes that history assessment instead of generic history confidence; thin/volatile histories can reduce strict anomaly confidence.
- PWA now loads `lib/acquisition-cost.js`; offline service-worker cache is **`huntiq-public-v44`**.
- `db/013_price_history_features.sql` derives store-isolated sequential price-history features.
- `db/016_price_anomaly_assessments.sql` persists the exact store-local anomaly/history evidence used by strict evaluation for later audit/tuning.
- **`db/017_acquisition_economics.sql`** persists checkout cost and deferred-credit economics separately for audit/tuning without rewriting price history.
- Alert deduplication/cooldown engine prevents repeated unchanged alerts while allowing material price or profit improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.
- Automated tests cover ingestion, history, anomaly lifecycle, economics, resale, evaluator, evidence, alerts, matching and retailer observation rights. v0.9.27 adds `tests/acquisition-cost.test.js` and deferred-credit alert coverage in `tests/evidence-gate.test.js`.

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: active asking/product evidence only; not completed-sale history. Marketplace Insights is restricted/not open to new users.
- Walmart Marketplace Item Search: UPC/GTIN/ASIN seller-catalog matching; not evidence of unrestricted consumer local-price/inventory.
- Best Buy: official developer API exposes pricing, availability, stores/store-aware availability and Open Box data; production requires developer key/terms and retention limits matter.
- Lowe's: official Developer Hub describes partner product catalog, store-aware pricing, promotions, inventory and availability; production requires onboarding/credentials/agreements.
- Home Depot / Staples / Ace / Target monetization and data routes researched with affiliate payout kept separate from ranking.
- Menards: official API Developer Portal exists and production access requires prior authorization. Its 11% Rebate Credit Check is a future store value, not an instant cash-price reduction.
- **Kohl's / Harbor Freight (v0.9.27):** public retailer terms reinforce the new promotion model. Newly earned Kohl's Cash is future store credit with redemption/return constraints; Harbor Freight coupons/member pricing may be real checkout discounts but can carry eligibility, quantity, stacking and expiration restrictions. See `docs/promotion-credit-modeling-2026-09-01.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Demo fixtures remain visibly demo-only.
- Source-specific retention/redistribution terms control what HUNTIQ may persist historically.
- Hunter/user scan observations preserve consent, provenance and verification separately from retailer/provider observations.
- A source being technically ingestible does not imply HUNTIQ may persist or redistribute it.
- Rebates/store credits are not equivalent to cash price reductions unless they are actually applied at checkout.
- Primary ROI must use actual cash/capital outlay; deferred credits may be represented only as separately identified expected value.
- Member-only/coupon pricing must carry eligibility/stacking/expiration restrictions when known; third-party `compare to` reference prices are not a substitute for HUNTIQ's store-local price-history baseline.

## NEXT — HIGH PRIORITY
- Integrate retailer observation contract and history-anomaly assessment directly into each authorized production source adapter.
- Surface strict history-confidence, cash outlay, deferred credit and confidence-adjusted economics more explicitly in customer deal details.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator and alert-delivery snapshots once backend storage is connected.
- Expand marketplace-specific fee/profit/ROI fixtures and retailer-specific promotion/rebate modeling, including eligibility and stacking.
- Add cloud accounts/watchlists and actual notification delivery after backend/account architecture is selected.

## EXTERNAL BLOCKERS / USER ACTION ONLY WHEN REQUIRED
- eBay production calls require developer credentials/application token; affiliate routing additionally requires partner-network setup.
- Best Buy production integration requires developer key and acceptance of API terms.
- Lowe's production integration requires partner onboarding, credentials and applicable agreements.
- Menards production API requires prior authorization.
- Ace/Home Depot/Staples/Target monetized routing requires relevant program application/acceptance and review of controlling terms.
- A legitimate completed-sale data source must be selected/authorized before demo sold history can be replaced.
- Private credentials/backend secrets must never be committed to this public repository.

## AGENT ASSIGNMENTS
No active parallel assignment recorded.

## HANDOFF
Continue from **v0.9.27**. Read `AGENTS.md`, this file, `README.md`, and `docs/data-flow-boundaries.md` before architecture changes.