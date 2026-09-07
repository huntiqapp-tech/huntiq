# Autonomous review provenance contract

The bounded repair workflow may write only after a successful production `HUNTIQ agent review handoff` run is independently bound to the exact autonomous PR revision. PR metadata, comments, commit messages, task text, and review findings are evidence or implementation input; none is an authorization source by itself.

## Trusted producer

The trusted producer is the default-branch `.github/workflows/agent-review.yml` workflow named `HUNTIQ agent review handoff`, with `scripts/claude-pr-review.py` as its reviewer. The repair workflow does not trust blob hashes copied into the autonomy PR. Instead it reads the current PM-controlled `main` revision from GitHub API state, resolves the review workflow and reviewer blobs there, and requires the exact historical producer revision for the triggering review run to have those same blobs. A trust-boundary change during an autonomous PR therefore fails closed until the PM starts a fresh bounded cycle.

The review packet must come from a successful `HUNTIQ tests` pull-request run for the exact reviewed SHA and PR. Packet/result artifact names are SHA-bound. The candidate's `test.yml` blob must equal the current `main` test workflow. The packet must record `max_automated_fix_attempts=2` and `auto_merge=false`.

Before an agent is allowed to edit, the workflow also re-verifies that the current PR is open, same-repository, targets `main`, was created by GitHub Actions on an `ai/issue-<issue>-<bootstrap-run>` branch, still has the exact reviewed SHA, and is linked to a live OWNER-authored `[AI BUILD]` issue and successful bootstrap run. The immutable task packet may change only from `status: pending` to `status: implemented`.

## Server-side bounded repair ledger

Two automated repair attempts is a hard ceiling. The authoritative ledger is the repository's production review-run history and the sanitized verdict artifacts produced by that separate read-only review workflow—not PR comments, agent-authored commits, or trailers.

For the autonomous PR, the repair workflow enumerates completed production review runs since PR creation, verifies each producer against the current trusted `main` review boundary, downloads the SHA-bound packet/result artifacts, and counts unique reviewed SHAs with a trusted `BLOCK` verdict. A first unique BLOCK permits attempt 1, a second unique BLOCK permits attempt 2, and any third unique BLOCK closes the automated write gate. Re-reviewing the same SHA does not increase the budget. Force-pushing the implementation branch cannot erase earlier workflow runs. Because review artifacts are retained for fourteen days, automatic repair refuses PRs approaching that retention window rather than allowing expired history to reset the ledger.

The repair workflow is globally serialized so two BLOCK runs cannot race the same bounded budget, and every write job rechecks the exact current PR head immediately before publishing.

## Protected boundary and credentials

`.github/huntiq-autonomous-protected-paths.txt` is the single authoritative protected-path list consumed by builder and repair workflows. `.github/huntiq-invariant-tests.txt` is the single explicit invariant-test list. Autonomous agents cannot modify `.github/`, these autonomy contract/provenance files, the protected invariant tests, or `.huntiq/tasks/current.md`. The workflows run the invariant gate, full `npm test`, credential-pattern checks, and a pinned TruffleHog scan before publishing agent changes.

Anthropic Workload Identity Federation configuration must be complete; there is no hardcoded workspace fallback. Agent jobs receive no source-write token and no shell/network tools. A separate publisher job re-authorizes the exact PR state and applies only the validated patch artifact.

Agents never merge `main`, auto-merge remains disabled, and the project manager is the final merge gate.
