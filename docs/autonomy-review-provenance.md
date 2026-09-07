# Autonomous review provenance contract

The bounded repair workflow is allowed to write only after the trusted `HUNTIQ agent review handoff` workflow completes successfully and the repair job independently binds that workflow run to the exact autonomous PR revision.

## Pinned producer

The only trusted artifact producer is `.github/workflows/agent-review.yml`, workflow name `HUNTIQ agent review handoff`. The trusted producer currently merged on `main` has blob SHA `99594e96d23d163b3cf75e54b5b8e7be4ec9cf16`. It is a default-branch `workflow_run` consumer of successful `HUNTIQ tests`; it prepares the packet with read-only repository permissions, resolves the PR from the triggering test run, records the exact tested SHA/repository/PR and hard repair cap of two, checks out only the trusted reviewer script with persisted credentials disabled, obtains Anthropic identity through GitHub OIDC, uploads the sanitized result from that exact run, and posts the verdict without merging or modifying the PR.

Required fail-closed checks before checkout or any agent write:

- triggering workflow name is `HUNTIQ agent review handoff` and its conclusion is `success`;
- triggering workflow run and downloaded artifacts are from the exact same GitHub Actions run in this repository;
- artifact metadata repository is this repository and is treated as evidence, never authorization by itself;
- the current PR head SHA equals the reviewed SHA;
- PR is open, targets `main`, is same-repository, and uses an `ai/issue-<issue>-<bootstrap-run>` branch;
- the source issue is OWNER-authored and begins `[AI BUILD]`;
- repair budget is exactly two attempts and authoritative server-visible attempt state has not reached the cap;
- protected workflow files and credential-like additions remain fail-closed;
- full `npm test` runs before any repair push;
- agents never merge `main` and auto-merge remains disabled.

## Bounded repair record

Two automated repair attempts is a hard ceiling. A PR-comment marker alone is not authoritative because comments can be edited or deleted. Before autonomy is considered live, the repair workflow must cross-check server-visible attempt markers against PR commit history (or an equivalently stronger GitHub server-side record). Any disagreement, history rewrite, ambiguous state, or evidence of deletion must disable further automated writes and escalate to the PM. Spoofed extra markers may only reduce the remaining budget; they must never create additional attempts.

This document is descriptive evidence, not an authorization source. Workflow code and GitHub API state remain authoritative and must fail closed if provenance cannot be verified.
