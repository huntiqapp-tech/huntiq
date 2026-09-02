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

## Security
Never commit API keys, OAuth secrets, access tokens, database credentials or private backend configuration to this repository.
