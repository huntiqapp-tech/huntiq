# HUNTIQ autonomy review contract

The bounded autonomous loop depends on the production default-branch `.github/workflows/agent-review.yml` workflow named `HUNTIQ agent review handoff`. That review gate is authoritative for automated review; only the project manager may merge an accepted autonomous PR.

## Trusted review provenance

The production handoff is triggered only by a completed `HUNTIQ tests` `workflow_run`. It proceeds only when the triggering run concluded successfully and was a pull-request run. The packet records repository, exact tested head SHA, head branch, workflow-run URL, PR number, `max_automated_fix_attempts=2`, and `auto_merge=false`, and uploads SHA-bound review artifacts.

Claude review checks out only the trusted reviewer script from the default-branch workflow revision with persisted checkout credentials disabled, obtains Anthropic identity through GitHub OIDC/WIF, consumes the SHA-bound review packet, and uploads a sanitized SHA-bound result. The posting job can post the result but cannot merge or modify source.

For autonomous `ai/issue-*` PRs, the repair workflow accepts a BLOCK only after it independently binds the production review run to the exact current same-repository PR head, successful exact-head HUNTIQ test run, OWNER-authored `[AI BUILD]` issue, successful bootstrap run, immutable task packet, and protected-path boundary. It verifies the historical review producer against the current PM-controlled `main` review workflow/reviewer blobs instead of trusting constants supplied by the candidate PR.

The two-attempt budget is derived from immutable production review-run history: unique SHA-bound trusted BLOCK verdicts for the PR permit at most attempts 1 and 2; a third unique BLOCK disables automated writing. Comments and agent-authored commits are not authoritative attempt state. Review-run artifact retention is treated as a hard history-coverage limit, so an old PR fails closed rather than resetting the budget.

Agents never merge `main`; auto-merge remains disabled.

## Required CI/integration invariants

`HUNTIQ tests` is the required test workflow. Autonomous builder and repair jobs additionally run the explicit tests listed in `.github/huntiq-invariant-tests.txt` and then the full `npm test` suite before any agent-generated patch may be published.

The protected regression boundary must prove, as applicable, that:

- customer-facing evidence fails closed when authority or provenance is missing/incomplete;
- resale and market-value calculations use completed sales rather than asking prices;
- retailer price history is isolated by retailer, product, and location/channel;
- promotions, rewards, rebates, and store credit do not contaminate raw shelf-price history;
- affiliate payout/value never affects deal ranking or Flip Score;
- credentials/secrets do not enter source, logs, browser code, or the PWA.

`.github/huntiq-autonomous-protected-paths.txt` is the single authoritative protected-path list for autonomous build and repair workflows. Agent jobs have read-only repository permissions plus WIF identity where needed, no shell/network tools, complete WIF configuration is required with no workspace fallback, and only a separately re-authorized publisher job may push the already-tested patch to the same `ai/issue-*` branch.

The production Claude reviewer is an additional fail-closed gate, not a substitute for tests. The project manager merges only after required tests pass and the production review verdict for the exact head is PASS, with no secret exposure or unresolved blocker.
