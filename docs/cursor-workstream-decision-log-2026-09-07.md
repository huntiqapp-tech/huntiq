# Cursor workstream decision log — 2026-09-07

Manager snapshot from GitHub + Cursor agent inventory. No product code was edited. No PRs were merged. No live/paid provider calls were run. No secrets are recorded here.

Coordinator: Cursor agent `bc-a6b5728f-4fe6-4cb8-aab2-ad35ed971643` (HUNTIQ Cursor workstream coordination).
Base: `origin/main` `4675efe` (package **0.9.109**, cache `huntiq-public-v109`; `PROJECT_STATUS.md` on main still lists stale 0.9.97 / v97).
Snapshot time: 2026-09-07 ~17:55 UTC.

Delegation note: this environment can list existing Cursor agents but cannot message them. Tightly scoped fixes are left as owner handoffs below. Do not spawn a second landing-page agent; that owner is still running.

## Ready / not-ready

| PR | Head | CI (PR Guard / full `npm test`) | Automated review on head | Human review | Merge-ready |
| --- | --- | --- | --- | --- | --- |
| [#137](https://github.com/huntiqapp-tech/huntiq/pull/137) bounded ingestion | `7917c94` | **Green** — run [34148989247](https://github.com/huntiqapp-tech/huntiq/actions/runs/34148989247) on `7917c94`; ingestion-runner, observation-contract, upcitemdb, preflight, schedule, Bright Data, live-history all passed | **BLOCK** on `7917c94` ([comment](https://github.com/huntiqapp-tech/huntiq/pull/137#issuecomment-5574107455)) | none | **NOT READY** |
| [#138](https://github.com/huntiqapp-tech/huntiq/pull/138) customer app / production data boundary | `947ce88` | **Green** — run [34148898022](https://github.com/huntiqapp-tech/huntiq/actions/runs/34148898022) on `947ce88`; customer-app-boundary, safe-storage, pwa-cache-manifest, pwa e2e, release-readiness passed | **BLOCK** on `947ce88` ([comment](https://github.com/huntiqapp-tech/huntiq/pull/138#issuecomment-5574097681)) | none | **NOT READY** |
| [#136](https://github.com/huntiqapp-tech/huntiq/pull/136) landing page | `bf46700` (in flight) | **In progress** on `bf46700`; last green was `d2dea95` run [34149462861](https://github.com/huntiqapp-tech/huntiq/actions/runs/34149462861). No longer draft. | **PASS** through `d2dea95`; `bf46700` review not yet posted at snapshot | none | **NOT READY** |

Do not treat CI green as merge-ready. `AGENTS.md` requires no unresolved review objection.

## Safe merge order (after each PR is review-clean)

**Do not merge any of these three now.**

When each PR below is independently ready:

1. **#137 first** — server-only ingestion. Does not touch `index.html` / `app.js` / `styles.css` / `sw.js`. Correctly keeps package **0.9.109** and cache `huntiq-public-v109`. Live-data-first priority. Alerts and history promotion stay off.
2. **#138 second** — customer-facing PWA and frozen `HUNTIQ_CUSTOMER_FEED` contract (`docs/customer-app-contract.md`). Owns package **0.9.111** and cache `huntiq-public-v111` via `lib/pwa-cache-manifest.js`. Rebase onto merged #137 only for `package.json`, `PROJECT_STATUS.md`, `README.md`, `docs/data-flow-boundaries.md`. Do not downgrade version/cache.
3. **#136 last** — presentation-only landing page. Heavy overlap with #138 (`index.html`, `app.js`, `styles.css`, `sw.js`, `package.json`). Must rebase onto merged #138. Must **drop independent v0.9.110 / `huntiq-public-v110`**. Inherit #138’s cache manifest, then bump once to **0.9.112 / `huntiq-public-v112`** if the landing copy requires a cache bust.

Merging #136 before #138 would clobber the production PWA boundary. Merging #136 as v110 after #138 as v111 would also collide on cache name and `sw.js` shape (hardcoded `CACHE` vs `MANIFEST.cache`).

File overlap verified:

- 136 ∩ 138: `PROJECT_STATUS.md`, `README.md`, `app.js`, `index.html`, `package.json`, `styles.css`, `sw.js`
- 137 ∩ 138: `PROJECT_STATUS.md`, `README.md`, `docs/data-flow-boundaries.md`, `package.json`
- 136 ∩ 137: `PROJECT_STATUS.md`, `README.md`, `package.json`

## Version / cache collision (exact)

| Line | Package | Offline cache |
| --- | --- | --- |
| `origin/main` | 0.9.109 (`package.json` / `sw.js`); `PROJECT_STATUS.md` still says 0.9.97 / v97 | `huntiq-public-v109` |
| #137 | 0.9.109 (no PWA bump — correct) | `huntiq-public-v109` |
| #136 | **0.9.110** | **`huntiq-public-v110`** (hardcoded in `sw.js`) |
| #138 | **0.9.111** | **`huntiq-public-v111`** (`lib/pwa-cache-manifest.js`) |
| #126 (out of this queue, UNSTABLE) | **0.9.110** | separate Codex/authority track |

#136 and #126 both claim 0.9.110. #136 must not keep that number after #138.

## Provenance / customer-authority boundary (preserve)

- Store / ZIP / channel stay isolated. Demo ZIP `18360` is sample identity, not a live local-market feed.
- Asking prices (including eBay Browse) are not completed-sale comps. #136 `bf46700` is tightening that copy; keep it.
- Shadow / validation-only / unlabeled / incomplete-authority rows stay hidden from customers.
- Browser never receives scraper snapshots, Bright Data raw rows, unvalidated RetailerAPI cells, or secrets.
- Customer feed is server-owned: `buildCustomerAuthorizedLivePayload` → `HUNTIQ_CUSTOMER_FEED` only. #137 must not auto-promote shadow files into that envelope.
- Alerts stay off until authenticated lookup, manual source comparison, display/retention rights, history promotion, verified resale evidence, and downside economics are all recorded as passing.

## Verified test evidence

### #137 `7917c94`

- GitHub PR Guard success: [34148989247](https://github.com/huntiqapp-tech/huntiq/actions/runs/34148989247) (full HUNTIQ test suite, including `tests/ingestion-runner.test.js`, `tests/observation-contract.test.js`, `tests/upcitemdb.test.js`, `tests/ingestion-preflight.test.js`, `tests/ingestion-schedule.test.js`, `tests/brightdata-home-depot.test.js`, `tests/live-history.test.js`).
- Latest fix commit `7917c94` normalizes `job.zip` / `job.zipcode` before fingerprinting (ZIP alias collapse; distinct ZIPs stay isolated).
- Live smoke was **not** executed (correct; secrets must stay owner-owned).

Independent manager check of `lib/ingestion-runner.js` on this head: the `ok` / `failClosed` expression still matches the BLOCK finding. `failClosed` is true only for live + zero results + missing-credentials-only. A live run with a non-credential provider error and zero results is `ok: false` but `failClosed: false`. A mixed success + hardFailure run can be `ok: true` with `partial: true`. Overlap lock currently returns `ok: true` with `overlapSkipped: true`.

### #138 `947ce88`

- GitHub PR Guard success: [34148898022](https://github.com/huntiqapp-tech/huntiq/actions/runs/34148898022), including `tests/customer-app-boundary.test.js`, `tests/safe-storage.test.js`, `tests/pwa-cache-manifest.test.js`, `pwa e2e tests passed`, `release-readiness checks passed`.
- Offline-banner flake was fixed in `947ce88` without changing the frozen feed contract.

Independent manager check of `lib/customer-app-boundary.js`: `classifyRow` falls back to `{kind:'demo', customerVisible:true}` when `HuntIQDataState` is unavailable. That is a fail-open visibility path and matches the BLOCK finding. `fromDemoFallback` still trusts the caller flag. Fixture-mode query parsing still includes `huntiq-mode=1` plus a `fixture` param.

### #136 `bf46700` (moving)

- Owner agent `bc-15f57fd0-cd66-4ee1-bba4-a00d4d3f2576` is **RUNNING**.
- Last completed PR Guard on `d2dea95`: [34149462861](https://github.com/huntiqapp-tech/huntiq/actions/runs/34149462861) success. Head `bf46700` CI was in progress at snapshot (`mergeStateStatus: UNSTABLE`).
- Automated reviews PASS on presentation-only scope through `d2dea95` (demo labeling, 0 connected sources, asking vs sold, alerts off). `bf46700` adds “eBay Evaluating is asking-only.”
- Collision with #138 is unresolved regardless of CI: v0.9.110 vs v0.9.111 and overlapping PWA files.

## Owner follow-ups (do not spawn duplicates)

Cursor cannot message existing agents from this run. Paste the matching task into the existing owner if Dakota wants it executed there.

### A. Ingestion owner — #137 — `bc-2facda9c-3211-44e7-afbe-38bb18c19023` (IDLE)

**Task:** Fix fail-closed `ok` semantics on `cursor/live-ingestion-runner-9023`. Do not enable alerts, history promotion, or live provider calls.

**Code to change:** `lib/ingestion-runner.js` (and tests). Do not edit PWA files. Do not bump package/cache.

**Acceptance tests:**

1. Live run, non-credential provider error, zero observations/identities → `ok: false`, `failClosed: true`, `partial: false`.
2. Mixed live run: one provider missing-credentials, another returns an observation → overall `ok: false` or explicit per-provider `failClosed`; `partial: true`; rejected missing-credential job remains visible; successful observation stays shadow-only.
3. Dry-run remains `ok: true` and must not write live idempotency fingerprints (already covered; do not regress).
4. `zip` vs `zipcode` still fingerprint as one location; `18360` vs `18064` do not.
5. UPCitemdb identities remain `priceAuthority: false` and produce no priced observations.
6. `npm test` green. Automated review on the new head must not remain BLOCK for this HIGH finding.
7. No secrets in logs/diff. No `HUNTIQ_CUSTOMER_FEED` injection from this PR.

**Blocker:** none for the code fix. Live smoke remains Dakota-owned after merge.

### B. PWA / production-readiness owner — #138 — `bc-b91841cb-dd61-4fd0-9fe3-5b49d72646a1` (IDLE)

**Task:** Fail closed when classification infrastructure is missing. Do not change the frozen customer-feed envelope.

**Code to change:** `lib/customer-app-boundary.js` plus `tests/customer-app-boundary.test.js`. Keep `docs/customer-app-contract.md` unchanged unless a field is actually wrong.

**Acceptance tests:**

1. If `HuntIQDataState` / `classifyOpportunityData` is unavailable, rows are withheld (`customerVisible: false`, not demo-visible). Alerts remain suppressed.
2. Unlabeled / shadow / incomplete `evidenceAuthority` rows stay hidden.
3. Demo fallback still labels `DEMO DATA` only for the bundled demo catalog.
4. Store/ZIP/channel provenance still render separately; channels are not blended.
5. `npm test` including `tests/customer-app-boundary.test.js` and `tests/pwa-e2e.test.js` green.
6. Automated review HIGH on `classifyRow` fallback is resolved. Optional: pin `browser-actions/setup-chrome` to a SHA in a follow-up if Dakota wants that supply-chain item closed before merge.

**Blocker:** none for the fail-closed fallback. Chrome action pin is Dakota’s call.

### C. Landing-page owner — #136 — `bc-15f57fd0-cd66-4ee1-bba4-a00d4d3f2576` (RUNNING)

**Task:** Finish the current asking-vs-sold copy polish, then **stop claiming v0.9.110**. Do not merge onto `main` until #138 has landed (or rebase onto #138 first if Dakota wants a stacked preview).

**After #138 exists on the base:**

1. Rebase onto merged #138 (or onto `cursor/pwa-customer-feed-boundary-46a1` only if Dakota explicitly wants a stacked PR).
2. Delete hardcoded `const CACHE='huntiq-public-v110'`. Use `lib/pwa-cache-manifest.js`.
3. Set package/cache to **0.9.112 / `huntiq-public-v112`** if landing assets change; never 0.9.110.
4. Keep landing sample-deal numbers bound to `demoDeals`; keep 0 Connected / 5 Evaluating / 2 Restricted from one `sources` array; keep ZIP 18360 labeled as demo provenance; keep eBay asking-only.
5. Do not touch `lib/*` decision, ingestion, or authority modules.

**Acceptance tests:** `node tests/landing-page.test.js`, existing PWA provenance tests, and full `npm test` after rebase. Confirm `overflowX: 0` still holds if markup shifts during rebase. Automated review remains PASS. No live-feed claims.

**Blocker:** #138 merge (or an explicit stacked rebase). Version/cache collision until that rebase.

## Dakota-owned blockers (not agent work)

1. **Do not merge #136, #137, or #138** until the matching BLOCK/collision items above are closed and a human review is clean.
2. **Do not run live/paid provider calls** from Cursor/Codex. After #137 is merged, configure runtime-only: `RETAILERAPI_KEY`, `BRIGHTDATA_API_TOKEN`, `BRIGHTDATA_TEST_URL`, optional `BRIGHTDATA_TEST_ZIP`, `UPCITEMDB_USER_KEY`. Then at most one sanitized smoke each. Values never in git, chat, fixtures, or screenshots.
3. **Manual source-page comparison** of any smoke snapshot before history promotion or customer display.
4. **Keep `alertsEnabled: false`** until lookup, source comparison, display/retention rights, validated history, verified resale, and downside economics are recorded as passing.
5. **Human merge** of the three PRs in the order above. This manager will not merge.
6. **Out-of-queue PRs** (do not mix into this order):
   - #126 `chatgpt/v0.9.110-authority-self-check` — UNSTABLE, also claims 0.9.110.
   - #121 `fix/v0.9.108-authority-gate-fail-closed` — CONFLICTING / DIRTY; likely superseded by #138’s fail-closed data-state work; close or rebase separately.
   - #127 / #135 autonomy loop — separate Codex track; not part of this Cursor merge train.
7. **Production host / CDN / DNS** is still not in-repo. #138 does not publish.
8. **Completed-sale provider** still required before any live 30/60/90 sold-history claim.

## Out of scope / frozen

No new scoring, risk, freshness, ranking, inventory, resale, or alert models. Passing tests do not justify that work. Do not substitute retailer-research PRs for this queue.

## Decision

Hold all three Cursor PRs. Sequence after review-clean: **#137 → #138 → #136 (rebased, cache inherited)**. Dakota owns merge, secrets, smoke, and alerts. Agents own only the three scoped code follow-ups above.
