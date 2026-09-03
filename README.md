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

## Data notice
The public preview currently uses clearly labeled demonstration opportunity data. Live retailer feeds, credentials, databases and private backend services are intentionally not stored in this public repository.

The server-only RetailerAPI shadow adapter is documented in `docs/retailerapi-live-ingestion.md`. It normalizes validated online observations with provenance, rejects stale or malformed provider cells, deduplicates observations and keeps customer alerts disabled until live validation is complete.

RetailerAPI shadow batches can now flow through the existing live-history and opportunity evaluation path without entering permanent history or enabling notifications. The bridge preserves provider provenance, deduplicates repeated observations, keeps online/store/ZIP history isolated, and emits auditable shadow-history rows for later server-side persistence.

The customer PWA classifies every opportunity as live, cached, delayed, demonstration or validation-only. Validation-only rows are hidden, non-live rows cannot alert, and only fresh validated live observations can retain alert eligibility after the existing safety decision floor runs.

The server-only customer payload builder requires an authenticated lookup result, a recorded manual source check, and explicit customer-display rights before RetailerAPI observations can be serialized for the PWA. It removes secret-bearing rows, preserves public provenance and channel/location identity, and leaves alerts disabled unless validation and the existing decision floor both pass.

The server-only retailer scraper foundation extracts public JSON-LD or price metadata only from explicit HTTPS host allowlists. Its Home Depot adapter preserves store/ZIP/online identity and emits canonical shadow observations with evidence URL, extractor, retrieval time, retention policy and redistribution state. Redirects, credentials, private/IP targets, stale observations and unsupported retailers fail closed; batch output is deduplicated and cannot alert.

## Security
Never commit API keys, OAuth secrets, access tokens, database credentials or private backend configuration to this repository.
