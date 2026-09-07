# Autonomous review provenance contract

The bounded repair workflow is allowed to write only after the trusted `HUNTIQ agent review handoff` workflow completes successfully and the repair job independently binds that workflow run to the exact autonomous PR revision.

Required fail-closed checks before checkout or any agent write:

- triggering workflow name is `HUNTIQ agent review handoff` and its conclusion is `success`;
- triggering workflow run head repository is this repository;
- artifact metadata repository is this repository;
- triggering workflow run head SHA equals the artifact `head_sha` and the current PR head SHA;
- PR is open, targets `main`, is same-repository, and uses an `ai/issue-<issue>-<bootstrap-run>` branch;
- the source issue is OWNER-authored and begins `[AI BUILD]`;
- repair budget is exactly two attempts and server-side attempt records have not reached the cap;
- protected workflow files and credential-like additions remain fail-closed;
- full `npm test` runs before any repair push;
- agents never merge `main` and auto-merge remains disabled.

The upstream review handoff itself is a default-branch `workflow_run` consumer of successful `HUNTIQ tests`. It uses read-only repository permissions while preparing the review packet, checks out only the trusted reviewer script at the workflow revision with credentials disabled, and never checks out or executes PR code. Its sanitized review result is posted by a separate job with pull-request comment permission only.

This document is descriptive evidence, not an authorization source. Workflow code and GitHub API state remain authoritative and must fail closed if provenance cannot be verified.
