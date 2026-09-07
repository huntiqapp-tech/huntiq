# HUNTIQ autonomy review contract

This document makes the bounded autonomous loop's dependency on the production review handoff verifiable from the autonomy change itself. The authoritative executable workflow remains the trusted default-branch `.github/workflows/agent-review.yml` named `HUNTIQ agent review handoff`.

## Trusted review provenance

The production handoff is triggered only by a completed `HUNTIQ tests` `workflow_run`. Its workflow definition comes from the trusted default branch. It proceeds only when the triggering run concluded successfully and was a pull-request run. The packet records repository, exact tested head SHA, head branch, workflow-run URL, PR number, `max_automated_fix_attempts=2`, and `auto_merge=false`. It fetches the PR metadata and diff for that tested PR and uploads a SHA-named review packet.

Claude review checks out only the trusted reviewer script from the workflow's trusted revision with persisted checkout credentials disabled, obtains Anthropic identity through GitHub OIDC/WIF, consumes the SHA-named review packet, and uploads a sanitized SHA-named review result. The posting job has pull-request write permission only and posts the sanitized result; it does not merge or modify source.

The autonomous repair workflow may consume a BLOCK result only after binding the artifact metadata back to the current same-repository `ai/issue-*` PR, exact current head SHA, `main` base, GitHub-Actions-created PR, OWNER-authored `[AI BUILD]` source issue, protected workflow-file boundary, and the server-side two-attempt record. A mismatch fails closed. Agents never merge `main` and auto-merge remains disabled.

## Required CI/integration invariants

`HUNTIQ tests` is the required test workflow. It runs the active live-data priority guard, targeted authority/customer-boundary regressions when present, and the full `npm test` suite. Autonomous builder and repair jobs also run the full `npm test` suite before any implementation/repair push.

The full suite is the enforcement boundary for HUNTIQ product invariants. Changes affecting these paths must carry integration/regression coverage proving, as applicable:

- customer-facing evidence fails closed when authority or provenance is missing/incomplete;
- resale/market-value calculations use completed sales rather than asking prices;
- retailer price history is isolated by retailer, product, and location/channel;
- promotions, rewards, rebates, and store credit do not contaminate raw shelf-price history;
- affiliate payout/value never affects deal ranking or Flip Score;
- credentials/secrets do not enter source, logs, browser code, or the PWA.

The production Claude reviewer is an additional fail-closed gate, not a substitute for these tests. The project manager merges only after required tests pass and the production review verdict for the exact head is PASS.
