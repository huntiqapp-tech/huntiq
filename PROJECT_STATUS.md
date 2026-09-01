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
- [x] Resale-history tests added and wired into the main test command (`tests/resale-history.test.js`, package version 0.9.20).

## CURRENT REALITY
The public preview is not yet a fully live deal engine. Demonstration opportunity data is intentionally used and should remain clearly labeled until replaced by verified integrations. Private credentials/backend services must not be committed to this public repository.

## NEXT — HIGH PRIORITY
- [ ] Audit the existing code and tests before changing architecture.
- [ ] Document the current data model and data-flow boundaries.
- [ ] Identify and implement the first legitimate live retailer data source with clear freshness/source metadata.
- [ ] Normalize retailer products/opportunities into a common schema.
- [ ] Build/validate resale comparable ingestion where lawful and technically available. eBay Browse is validated for active asking-market evidence; production calls require developer credentials.
- [ ] Select/authorize a legitimate completed-sale data source before replacing demo 30 / 60 / 90-day sold metrics. eBay Marketplace Insights is restricted and not open to new users, so Browse API must not be used as a sold-history substitute.
- [ ] Connect a legitimate completed-sale ingestion adapter to `lib/resale-history.js` and `db/011_resale_comparables.sql`.
- [ ] Feed live resale-history confidence/sample-size output into customer presentation and the evidence gate.
- [ ] Feed capital-efficiency output into the final customer feed/alert orchestration once real resale velocity inputs are available.
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
- Walmart's public Marketplace Item Search documentation now supports UPC/GTIN/ASIN catalog matching, but it is a Marketplace/seller integration surface rather than evidence that unauthenticated consumer-store pricing or local inventory is available; do not treat it as a live local-deal feed without authorization and license review.
- Production backend/hosting architecture should be chosen based on the live integration requirements; do not migrate simply for novelty.

## HANDOFF NOTE
The product owner expects continuity across ChatGPT, Codex and other agents. A new agent must not assume an empty project. Read `AGENTS.md`, this file, `README.md`, and inspect the repository before doing work. Update this file at the end of the task so the next agent knows exactly what changed and what remains.
