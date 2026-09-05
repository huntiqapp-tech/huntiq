# HUNTIQ automation orchestration

HUNTIQ uses GitHub as the source of truth for automated development work.

## Flow

1. An agent creates or updates a task branch and pull request.
2. `HUNTIQ tests` runs the PR Guard with least-privilege read access.
3. The guard runs active-priority checks, targeted customer-boundary/authority regressions when present, and the full test suite.
4. Only a successful PR workflow creates a post-CI review packet through `HUNTIQ agent review handoff`.
5. The review packet contains the exact tested SHA, PR metadata, diff, and HUNTIQ review contract.
6. Cloud AI review may be connected later with a scoped provider secret. Desktop Claude/Grok sessions are not required for the GitHub-side handoff.
7. Automated fix loops are capped at two attempts.
8. Auto-merge is disabled. `main` remains a reviewed destination, not an agent work branch.

## Safety rules

- Agents never push directly to `main`.
- Customer-facing evidence fails closed when required authority/provenance is missing or incomplete.
- Completed-sale evidence drives resale valuation; asking prices are liquidity context only.
- Retailer price histories remain retailer/product/location-or-channel specific.
- Promotions, rewards, rebates, and conditional prices stay separate from raw shelf-price history.
- Affiliate economics never influence deal ranking or Flip Score.
- Secrets remain in scoped GitHub Actions secrets or provider-managed credentials and never enter source, logs, browser code, or the PWA.
- CI success is necessary but not sufficient for merge; integration review still matters.

## Current automation boundary

The repository-side CI and review-packet handoff are cloud-hosted and continue when a developer Mac sleeps or closes. Actual cloud AI execution is intentionally not enabled until a provider credential is configured. That credential is the only external requirement for the next automation stage.
