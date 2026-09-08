# Merge handoff — live ingestion runner

Date: 2026-09-07
Branch: `cursor/live-ingestion-runner-9023`
Base: `main`

## Merge readiness

Credential-free ingestion work is complete. Local `npm test` passed after the observation-contract aliases. GitHub PR Guard on this branch passed on both pushed SHAs (`8f0578f`, `afe2bba`); re-run CI on the contract commit before merge.

Do **not** merge if a reviewer requires live provider smoke in this PR. Smoke is fail-closed until owner-owned secrets exist. That is an environment gap, not an implementation gap.

## What this branch is

Server-only collection: unified runner, Bright Data bounded lifecycle, RetailerAPI shadow adapter (pre-existing, wired), UPCitemdb identity, scraper batch, overlap lock, dry-run/one-shot/schedule CLIs, preflight names-only, fixture tests, operations docs, and the canonical observation contract.

Alerts stay disabled. History promotion stays off. Live observations stay shadow/internal.

## What this branch is not

- No PWA, `app.js`, service worker, or customer-payload edits.
- No alert enablement.
- No authenticated provider smoke (secrets absent in this runtime).
- No new scoring/risk/freshness/ranking model.

## Canonical contract

See `docs/live-observation-contract.md`.

Adapters now emit:

- `quantity` (shelf count) plus aliases `inventory` / `inventoryCount`
- `zip` plus alias `zipcode`
- structured `source` object plus scalars `provider`, `sourceFamily`, `sourceUrl` / `url`
- `channel` normalized to `online` | `local`
- `locationKey` including channel and store/ZIP/online

Projectors `toLegacyHistoryFields` and `toRightsContractFields` are the only supported way to flatten `source` to a string for older helpers. Do not feed canonical objects into `lib/history.js` as-is.

`live-history.historyKey` now includes channel and store/ZIP/online location so online and local observations cannot share a price-history series. PWA compactors still default missing `storeId` to the string `"online"`.

## Commands

```sh
npm test
npm run ingest:preflight
npm run ingest:dry-run -- --providers retailerapi,brightdata,upcitemdb --jobs-file config/ingestion-jobs.example.json
```

Rollback: `INGEST_MODE=dry-run`, stop cron, do not promote shadow files. Details in `docs/live-ingestion-operations.md`.

## Owner-owned after merge

Configure these names in trusted server-side secret storage, values never in git:

- `RETAILERAPI_KEY`
- `BRIGHTDATA_API_TOKEN`
- `BRIGHTDATA_TEST_URL`
- `BRIGHTDATA_TEST_ZIP` (optional)
- `UPCITEMDB_USER_KEY`

Then at most one sanitized smoke each: `npm run smoke:retailerapi`, `npm run smoke:brightdata`. Keep alerts off until a recorded manual source check.

## Reviewer checklist

- No secrets in diff or logs
- No PWA/customer-path files
- Bright Data polling still hard-capped; trigger not retried
- UPCitemdb has no priced observations
- Observation aliases stay equal (`quantity === inventory`, `zip === zipcode`, `source.provider === provider`)
