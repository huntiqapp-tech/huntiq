# HUNTIQ

**Find. Flip. Profit.**

Public-facing HUNTIQ PWA preview for retail deal discovery and resale intelligence.

## Current public build
- Responsive mobile-first interface
- Demonstration opportunity scoring UI
- 30/60/90-day resale snapshot presentation
- Profit, ROI and Flip Score presentation
- Persistent browser watchlist using localStorage
- Retailer / marketplace integration status
- Installable PWA manifest and offline service worker
- No-scrape ENP Calculator (`calculator.html`) for user-pasted buy prices and comps — ENP, max buy, ROI, BUY/MAYBE/PASS; 3 free local runs per day

## Data notice
The public preview currently uses clearly labeled demonstration opportunity data unless a trusted server injects `HUNTIQ_CUSTOMER_FEED`. Live retailer feeds, credentials, databases and private backend services are intentionally not stored in this public repository. The browser never calls RetailerAPI, Bright Data, or scraper internals.

Zero-network staging: open `/?huntiq-mode=fixture`. Health metadata is in `health.json`. Preview vs production and remaining credential-only blockers are in `docs/release-readiness.md`. The frozen Scraper Engineer contract is `docs/customer-app-contract.md`. Integration handoff: `docs/customer-feed-integration-handoff.md`.

The server-only RetailerAPI shadow adapter is documented in `docs/retailerapi-live-ingestion.md`. It normalizes validated online observations with provenance, rejects stale or malformed provider cells, deduplicates observations and keeps customer alerts disabled until live validation is complete.

RetailerAPI shadow batches can now flow through the existing live-history and opportunity evaluation path without entering permanent history or enabling notifications. The bridge preserves provider provenance, deduplicates repeated observations, keeps online/store/ZIP history isolated, and emits auditable shadow-history rows for later server-side persistence.

The customer PWA classifies every opportunity as live, cached, delayed, demonstration or validation-only. Validation-only rows are hidden, non-live rows cannot alert, and only fresh validated live observations can retain alert eligibility after the existing safety decision floor runs.

The server-only customer payload builder requires an authenticated lookup result, a recorded manual source check, and explicit customer-display rights before RetailerAPI observations can be serialized for the PWA. It removes secret-bearing rows, preserves public provenance and channel/location identity, and leaves alerts disabled unless validation and the existing decision floor both pass.

The server-only retailer scraper foundation extracts public JSON-LD or price metadata only from explicit HTTPS host allowlists. Its Home Depot adapter preserves store/ZIP/online identity and emits canonical shadow observations with evidence URL, extractor, retrieval time, retention policy and redistribution state. Redirects, credentials, private/IP targets, stale observations and unsupported retailers fail closed; batch output is deduplicated and cannot alert.

## Live ingestion (server-only)

The unified ingestion runner, unattended one-shot/schedule entry points, and operations notes live in `docs/live-ingestion-operations.md`. The canonical observation field contract (quantity vs inventory, structured `source`, ZIP/channel keys) is `docs/live-observation-contract.md`. Defaults are dry-run, explicit provider selection, conservative record caps, overlap locking, bounded timeouts/retries, and shadow/internal output with alerts disabled.

```sh
npm run ingest:preflight
npm run ingest:dry-run -- --providers retailerapi,brightdata,upcitemdb --jobs-file config/ingestion-jobs.example.json
npm test
```

Live provider calls require trusted runtime secrets named `RETAILERAPI_KEY`, `BRIGHTDATA_API_TOKEN`, `BRIGHTDATA_TEST_URL`, and `UPCITEMDB_USER_KEY`. Preflight prints those names and configured/missing status only — never values. UPCitemdb is product identity, not retailer-price verification.

Rollback: keep `INGEST_MODE=dry-run`, stop any cron/systemd unit, and do not promote shadow observations.

## Security
Never commit API keys, OAuth secrets, access tokens, database credentials or private backend configuration to this repository.
