# HUNTIQ — Project Status

Last established from the repository and product handoff: 2026-09-01.

This is a living handoff. Agents must update it after meaningful work.

## DONE / PRESENT IN CURRENT PUBLIC BUILD
- [x] Public-facing HUNTIQ PWA preview.
- [x] Responsive mobile-first interface.
- [x] Opportunity/deal scoring presentation.
- [x] 30 / 60 / 90-day resale snapshot presentation.
- [x] Profit and ROI presentation.
- [x] Flip Score presentation.
- [x] Browser-persistent watchlist using localStorage.
- [x] Retailer / marketplace integration-status presentation.
- [x] Installable PWA manifest.
- [x] Offline service worker.
- [x] Demo-data disclosure in repository documentation.
- [x] Persistent agent handoff instructions in `AGENTS.md`.
- [x] Evidence gate that suppresses alerts when price history, anomaly, resale, freshness, or downside evidence is weak.
- [x] Capital-velocity engine that normalizes profit/ROI by expected days-to-sell, estimates sell-through/liquidity, and penalizes slow or illiquid alert candidates.
- [x] Capital-velocity persistence migration (`db/010_capital_velocity.sql`).
- [x] Target public price/fulfillment normalization research (`docs/retailer-target.md`).
- [x] eBay Browse resale/affiliate integration semantics documented (`docs/resale-ebay.md`), including the hard rule that Browse listings are asking-price evidence and cannot be represented as sold history.
- [x] Strict completed-sale resale aggregation (`lib/resale-history.js`) that calculates shipping-inclusive 30/60/90-day median/mean/quartiles, sample counts, dispersion, match/source quality, freshness-sensitive confidence, trend, preferred market-value window, and evidence sufficiency.
- [x] Asking/listed/cancelled rows are explicitly excluded from sold-history calculations; active eBay Browse results therefore cannot contaminate completed-sale metrics.
- [x] Completed-sale comparable persistence migration (`db/011_resale_comparables.sql`) with product/source/time indexes and an evidence-kind constraint.
- [x] Integrated opportunity evaluator (`lib/opportunity-evaluator.js`) connects completed-sale history to channel fee/profit/ROI math and the evidence gate.
- [x] Downside resale economics use the preferred sold-history window's lower quartile (P25); an otherwise attractive deal is suppressed when risk-adjusted downside ROI turns negative.
- [x] Integrated evaluator tests verify active asking listings stay out of sold history and negative downside economics suppress alerts (`tests/opportunity-evaluator.test.js`).
- [x] PWA evaluator bridge (`lib/pwa-opportunity.js`) converts deal-board inputs into strict completed-sale/channel/evidence evaluation inputs, while clearly marking generated demo comparables as demo-only.
- [x] PWA runtime (`lib/pwa-runtime.js`) now applies strict evaluator market value, risk-adjusted profit/ROI, recommendation, alert eligibility and blockers to the browser deal board after initial opportunity construction.
- [x] Browser now loads `resale-history`, `evidence-gate`, `opportunity-evaluator`, and the PWA bridge/runtime; offline service-worker cache includes those modules.
- [x] Integrated evaluation persistence migration (`db/012_opportunity_evaluations.sql`) stores market window, resale confidence, completed-sale count, downside economics, selected channel, recommendation, alert eligibility and evidence blockers for auditability.
- [x] PWA bridge tests (`tests/pwa-opportunity.test.js`) are wired into the main suite.
- [x] Best Buy API fit/terms research documented (`docs/best-buy-api-fit-2026-09-01.md`), including near-real-time product pricing/availability, in-store availability capability, Open Box data, published rate limits, 72-hour cache limit and developer-key/terms requirements.
- [x] Public affiliate research documented for Home Depot and Staples (`docs/affiliate-retailer-research-2026-09-01.md`), reinforcing that affiliate payout metadata must remain separate from HUNTIQ opportunity scoring.
- [x] Strict evaluator now runs the capital-velocity model before final alert gating. Slow resale velocity downgrades instant alerts; clearly illiquid markets can suppress an otherwise profitable opportunity.
- [x] Active asking listings remain excluded from sold-price history but may contribute only to liquidity/sell-through context.
- [x] PWA dependency order now loads `capital-velocity.js` before the strict evaluator and exposes strict velocity output through `pwa-runtime.js`; offline cache bumped to `huntiq-public-v42`.
- [x] Price-history feature migration (`db/013_price_history_features.sql`) adds location-isolated sequential history features, prior-12 baselines, markdown/drop percentages and anomaly-oriented history signals without blending stores.
- [x] Lowe's official Developer Hub research documented (`docs/lowes-api-fit-2026-09-01.md`): partner product catalog, store-aware pricing, inventory/availability and feed/API capabilities are publicly described, but production access requires partner onboarding, credentials and applicable data terms.
- [x] Package version is 0.9.23; velocity-aware evaluator test coverage includes profitable-but-illiquid suppression.

## CURRENT REALITY
The public preview is not yet a fully live deal engine. Demonstration opportunity data is intentionally used and should remain clearly labeled until replaced by verified integrations. The browser path now uses the strict evaluator for displayed market/profit/ROI and alert eligibility, and that strict path now includes resale capital velocity/liquidity before alerts qualify. The demo preview still derives completed-sale fixtures from demo 30/60/90 summaries until a rights-cleared live sold-data provider is connected. Private credentials/backend services must not be committed to this public repository.

## NEXT — HIGH PRIORITY
- [ ] Audit the existing code and tests before changing architecture.
- [ ] Document the current data model and data-flow boundaries.
- [ ] Identify and implement the first legitimate live retailer data source with clear freshness/source metadata.
- [ ] Normalize retailer products/opportunities into a common schema.
- [ ] Build/validate resale comparable ingestion where lawful and technically available. eBay Browse is validated for active asking-market evidence; production calls require developer credentials.
- [ ] Select/authorize a legitimate completed-sale data source before replacing demo 30 / 60 / 90-day sold metrics. eBay Marketplace Insights is restricted and not open to new users, so Browse API must not be used as a sold-history substitute.
- [ ] Connect a legitimate completed-sale ingestion adapter to `lib/resale-history.js` and `db/011_resale_comparables.sql`.
- [ ] Persist production evaluator snapshots into `db/012_opportunity_evaluations.sql` once backend storage is connected.
- [ ] Feed capital-efficiency output into final customer feed ordering once real resale velocity inputs are available.
- [ ] Validate fee, profit and ROI calculations with additional marketplace-specific fixtures as production channels are selected.
- [ ] Refine Flip Score only after real input data is trustworthy.

## LATER
- [ ] Expand major-retailer coverage incrementally.
- [ ] Expand resale-marketplace coverage incrementally.
- [ ] Cloud accounts/watchlists.
- [ ] Alerts for watched opportunities or meaningful price changes.
- [ ] Premium/monetization features after the core live-data product is dependable.

## AGENT ASSIGNMENTS
Before starting a new parallel agent, record its task here to prevent duplicate work.

- No active assignment recorded in this file at creation time.

## BLOCKERS / OPEN DECISIONS
- Exact production retailer-data providers/APIs must be selected based on legality, reliability, cost and coverage.
- eBay Browse production ingestion requires eBay developer credentials/application token; eBay Partner Network configuration is additionally required before monetized affiliate routing.
- Exact completed-sale marketplace data access must be selected/validated before claiming 30/60/90-day sold-price history is live.
- Walmart's public Marketplace Item Search documentation supports UPC/GTIN/ASIN catalog matching, but it is a Marketplace/seller integration surface rather than evidence that unauthenticated consumer-store pricing or local inventory is available; do not treat it as a live local-deal feed without authorization and license review.
- Best Buy is technically attractive because its developer API exposes pricing, availability and store-aware product queries, but production use requires a developer key and acceptance of API terms; its published terms also limit caching to 72 hours, so it must not be treated as an unrestricted long-term historical-price warehouse.
- Lowe's now publicly documents partner access to product catalog, pricing, promotions, inventory and store-aware availability, but production integration requires organization/app onboarding, credentials and review of retention/redistribution terms before HUNTIQ stores long-term price history.
- Home Depot publicly operates a Creator/shoppable-link program and Staples publicly operates an affiliate program, but HUNTIQ must be separately accepted and the applicable software/deal-site/data-display terms reviewed before monetized routing is enabled. Affiliate payout must never influence opportunity ranking.
- Production backend/hosting architecture should be chosen based on the live integration requirements; do not migrate simply for novelty.

## HANDOFF NOTE
The product owner expects continuity across ChatGPT, Codex and other agents. A new agent must not assume an empty project. Read `AGENTS.md`, this file, `README.md`, and inspect the repository before doing work. Update this file at the end of the task so the next agent knows exactly what changed and what remains.
