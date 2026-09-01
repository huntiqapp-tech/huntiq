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

## CURRENT REALITY
The public preview is not yet a fully live deal engine. Demonstration opportunity data is intentionally used and should remain clearly labeled until replaced by verified integrations. Private credentials/backend services must not be committed to this public repository.

## NEXT — HIGH PRIORITY
- [ ] Audit the existing code and tests before changing architecture.
- [ ] Document the current data model and data-flow boundaries.
- [ ] Identify and implement the first legitimate live retailer data source with clear freshness/source metadata.
- [ ] Normalize retailer products/opportunities into a common schema.
- [ ] Build/validate resale comparable ingestion where lawful and technically available.
- [ ] Calculate 30 / 60 / 90-day resale metrics from real comparables rather than demo values.
- [ ] Add confidence/sample-size indicators so sparse resale data is not overstated.
- [ ] Validate fee, profit and ROI calculations with tests.
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
- Exact resale-marketplace data access must be selected/validated before claiming sold-price history is live.
- Production backend/hosting architecture should be chosen based on the live integration requirements; do not migrate simply for novelty.

## HANDOFF NOTE
The product owner expects continuity across ChatGPT, Codex and other agents. A new agent must not assume an empty project. Read `AGENTS.md`, this file, `README.md`, and inspect the repository before doing work. Update this file at the end of the task so the next agent knows exactly what changed and what remains.
