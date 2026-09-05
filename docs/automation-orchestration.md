# HUNTIQ automation orchestration

HUNTIQ uses GitHub as the source of truth for automated development work.

## Flow

1. An agent creates or updates a task branch and pull request.
2. `HUNTIQ tests` runs the PR Guard with least-privilege read access.
3. The guard runs active-priority checks, targeted customer-boundary/authority regressions when present, and the full test suite.
4. Only a successful PR workflow creates a post-CI review packet through `HUNTIQ agent review handoff`.
5. The review packet contains the exact tested SHA, PR metadata, diff, and HUNTIQ review contract.
6. `HUNTIQ agent review handoff` runs three jobs: `prepare-review` (reads PR metadata/diff via the GitHub API only, no checkout of PR code, no credentials), `claude-review` (the only job with `id-token: write`; exchanges a GitHub OIDC token for a short-lived Anthropic access token via Workload Identity Federation -- no static API key -- and asks Claude to review the untrusted packet, never executing anything from the PR), and `post-review` (only `pull-requests: write`, no credentials, posts the already-sanitized verdict).
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

The repository-side CI and review-packet handoff are cloud-hosted and continue when a developer Mac sleeps or closes. The `claude-review` job's code is complete and self-checked, and authenticates using Anthropic Workload Identity Federation only -- it deliberately never uses a static `ANTHROPIC_API_KEY`. It cannot run end-to-end yet because four Anthropic-side identifiers have not been configured as GitHub Actions repository variables (Settings -> Secrets and variables -> Actions -> Variables):

- `ANTHROPIC_ORGANIZATION_ID`
- `ANTHROPIC_FEDERATION_RULE_ID`
- `ANTHROPIC_SERVICE_ACCOUNT_ID`
- `ANTHROPIC_WORKSPACE_ID` (only if the federation rule spans more than one workspace)

None of these exist in this repository today (`gh variable list` / `gh secret list` are both empty). Until they are set, the `claude-review` job fails fast with a clear `::error::` explaining exactly what is missing -- it does not fall back to a static key and does not silently skip the review.
