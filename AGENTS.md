# HUNTIQ — Agent Operating Instructions

This file is the persistent handoff for Codex and other coding agents working on HUNTIQ.

## First rule
Before changing code, read this file, `README.md`, and inspect the existing repository. Treat the repository as the source of truth for what is actually implemented. Do not rebuild or replace working functionality merely because a new agent did not create it.

## Verification-first rule
For all HUNTIQ work, verify claims against the repository, test results, connected tools, provider documentation, or current public sources before presenting them as fact. Do not infer that a feature, credential, integration, purchase, merge, workflow result, or provider capability exists merely because it was discussed previously. If a fact cannot be verified, label it as unverified or pending instead of guessing. Prefer spending extra time checking over advancing work on a false assumption.

Maintain HUNTIQ continuity through this repository. Important product decisions, architecture rules, integration status, research findings, blockers, and completed work that future Codex/agent sessions need must be recorded in `AGENTS.md`, `PROJECT_STATUS.md`, or the appropriate durable project documentation rather than existing only in conversation history.

## Product mission
HUNTIQ is a mobile-first retail deal discovery and resale-intelligence product. The goal is to help a user identify unusually good retail buying opportunities — including major discounts and potential pricing errors — and quickly judge whether an item is worth buying for personal savings or resale.

Tagline currently used: **Find. Flip. Profit.**

## Core product direction
HUNTIQ should combine:
- Retail deal discovery from legitimate major retailers such as Home Depot, Lowe's, Amazon, Walmart, Target, Best Buy and other appropriate retailers as integrations become available.
- Detection/ranking of unusually low prices, major discounts and potential pricing anomalies. Never present an unverified anomaly as a guaranteed pricing error.
- Resale intelligence across seller marketplaces such as eBay and other lawful/available marketplace data sources.
- 30 / 60 / 90 day resale views where supported by reliable data.
- Estimated profit, ROI, fees and a simple HUNTIQ/Flip Score that helps users prioritize opportunities.
- Watchlist/saved opportunities and eventually alerts when useful.
- A polished consumer-facing experience rather than a developer dashboard.

## Current repository state
The public repository already contains a working public-facing PWA preview. The README records these implemented pieces:
- Responsive mobile-first interface.
- Demonstration opportunity-scoring UI.
- 30/60/90-day resale snapshot presentation.
- Profit, ROI and Flip Score presentation.
- Persistent browser watchlist using localStorage.
- Retailer / marketplace integration-status presentation.
- Installable PWA manifest and offline service worker.

The current top-level project includes `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js`, `db/`, `lib/`, `docs/`, `tests/`, and `.github/`. Inspect these before proposing architecture changes.

## Data status / honesty requirement
The public preview currently uses clearly labeled demonstration opportunity data. Live retailer feeds, credentials, databases and private backend services are intentionally not stored in this public repository.

Do not make fake/demo data look live. UI must clearly distinguish demo, cached, delayed, estimated and live data. Never claim HUNTIQ found a live price error unless the underlying source actually supports that claim.

## Security
Never commit API keys, OAuth secrets, access tokens, database credentials, private backend configuration, customer secrets, or scraping credentials to this public repository. Use environment variables / secret storage for private infrastructure.

## Agent workflow
1. Read `AGENTS.md` and `PROJECT_STATUS.md` if present.
2. Read `README.md`.
3. Inspect the relevant existing files and recent implementation before coding.
4. Verify current facts and assumptions before implementing against them.
5. Preserve working functionality and the approved consumer-facing direction.
6. Make the smallest coherent change that advances the roadmap.
7. Run available tests/checks before declaring work complete.
8. Update `PROJECT_STATUS.md` whenever a meaningful feature is completed, started, blocked or reprioritized.
9. Record important architecture/product assumptions, integration facts, retailer research, and blockers instead of leaving them only in an agent conversation.
10. Never fabricate commits, pull requests, CI results, live-data status, credentials, provider access, or completed features.

## Multi-agent rule
Do not duplicate another agent's active task. Prefer clearly separated workstreams (for example UI, data ingestion, resale intelligence, testing). Check repository/status state before beginning. If another change has landed, re-read the affected files before continuing.

## Product priorities
Until explicitly changed, prioritize in this order:
1. Preserve and stabilize the existing public PWA.
2. Replace demonstration opportunities with legitimate, maintainable live-data integrations incrementally.
3. Build normalized product/deal data so retailers can be compared consistently.
4. Build trustworthy resale-comparable calculations (sold-price windows, fees, profit, ROI, confidence).
5. Improve opportunity ranking/Flip Score using real evidence.
6. Add accounts/cloud watchlists/alerts only when the underlying data flow is dependable.
7. Monetization and premium features should sit on top of a useful free/core experience, not block validation of the product.

## Design principles
- Mobile first.
- Fast and easy to scan.
- Consumer-friendly language.
- High-value information first: current price, normal/reference price, discount, resale estimate, profit, ROI, confidence and source freshness.
- Avoid clutter and unnecessary admin/developer controls in the customer experience.
- Do not radically redesign the approved UI without an explicit product decision.

## Definition of done for an agent task
A task is not complete merely because code was written. The change should be integrated with the existing project, avoid regressions, use truthful data labels, keep secrets out of the repo, pass available checks, and leave `PROJECT_STATUS.md` accurate enough for the next agent to continue without rediscovering the work.
