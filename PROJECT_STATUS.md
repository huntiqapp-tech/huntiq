# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-01. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.24**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Opportunity presentation with HUNTIQ/deal scoring, 30/60/90 resale snapshot, profit, ROI, Flip Score, recommendation and alert status.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- Completed-sale persistence in `db/011_resale_comparables.sql`.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics and integrated evaluator in `lib/opportunity-evaluator.js`.
- Evidence gate suppresses weak/stale/unsafe opportunities.
- Capital-velocity engine estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- **v0.9.24:** customer feed now incorporates capital efficiency. Otherwise-equivalent fast-turn deals outrank slow flips; slow markets are capped and illiquid markets get zero feed priority.
- PWA strict runtime exposes resale/economics/recommendation/evidence and strict capital velocity.
- Price-history feature migration `db/013_price_history_features.sql` derives store-isolated previous price, prior-12 baselines, percentage drops and anomaly-oriented history features without blending locations.
- Integrated evaluator snapshot persistence in `db/012_opportunity_evaluations.sql`.
- **v0.9.24:** alert deduplication/cooldown engine in `lib/alert-dedupe.js` prevents repeated unchanged alerts while allowing material price or profit improvements through immediately.
- **v0.9.24:** alert delivery audit state in `db/014_alert_delivery_state.sql` stores fingerprints, opportunity/user keys, alert level, economics, sent time and delivery reason.
- **v0.9.24:** `docs/data-flow-boundaries.md` documents the production chain and hard evidence/licensing boundaries from retailer observation through history, anomaly, resale, economics, velocity, evidence gating, alert delivery and PWA presentation.
- Automated tests cover ingestion, history identity/freshness, anomaly lifecycle, fulfillment, economics, quantity, resale history, evaluator, capital velocity, evidence, feed, alerts, matching, price consensus and new alert dedupe/feed-velocity behavior.

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: valid for active asking-market/product evidence and affiliate-aware links after credentials; **not** valid as completed-sale history. Marketplace Insights is restricted/not open to new users.
- Walmart Marketplace Item Search: useful for UPC/GTIN/ASIN seller-catalog matching; not evidence of an unrestricted consumer local-price/inventory feed.
- Best Buy: official developer API exposes pricing, availability, stores/store-aware availability and Open Box data; production requires developer key/terms and published cache limits prevent treating it as unrestricted permanent history.
- Lowe's: official Developer Hub publicly describes partner product catalog, store-aware pricing, promotions, inventory and availability; production requires organization/app onboarding, credentials and applicable data terms.
- Home Depot / Staples: public affiliate routes researched; payout metadata must remain separate from HUNTIQ ranking.
- **Ace Hardware:** public affiliate program researched in `docs/ace-retailer-fit-2026-09-01.md`. Current affiliate page points to Impact while a public participation agreement still references Pepperjam, so controlling onboarding terms must be reviewed before coding monetized routing. No unrestricted public Ace local-price/inventory API was established by this research.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Demo fixtures remain visibly demo-only.
- Source-specific retention/redistribution terms control what HUNTIQ may persist historically.
- Hunter/user scan observations must preserve consent, provenance and verification level separately from retailer/provider observations.

## NEXT — HIGH PRIORITY
- Continue auditing and strengthening the PWA execution path so strict feed priority and alert-delivery decisions are visible end-to-end.
- Add a normalized retailer observation adapter contract and fixtures for the first rights-cleared production source.
- Connect a legitimate completed-sale provider to `lib/resale-history.js` / `db/011_resale_comparables.sql` before claiming live 30/60/90 sold history.
- Persist production evaluator and alert-delivery snapshots once backend storage is connected.
- Expand marketplace-specific fee/profit/ROI fixtures.
- Refine anomaly/Flip Score only after real retailer/history inputs are trustworthy.
- Add cloud accounts/watchlists and actual notification delivery after backend/account architecture is selected.

## EXTERNAL BLOCKERS / USER ACTION ONLY WHEN REQUIRED
- eBay production calls require developer credentials/application token; affiliate routing additionally requires partner-network setup.
- Best Buy production integration requires developer key and acceptance of API terms.
- Lowe's production integration requires partner onboarding, credentials and applicable agreements.
- Ace/Home Depot/Staples monetized routing requires program application/acceptance and review of controlling terms.
- A legitimate completed-sale data source must be selected/authorized before demo sold history can be replaced.
- Private credentials/backend secrets must never be committed to this public repository.

## AGENT ASSIGNMENTS
No active parallel assignment recorded.

## HANDOFF
Do not assume an empty project. Read `AGENTS.md`, this file, `README.md`, `docs/data-flow-boundaries.md`, and inspect the repository before changing architecture. Continue from v0.9.24.
