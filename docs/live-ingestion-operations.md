# Live ingestion operations

Server-only HUNTIQ ingestion for Bright Data, RetailerAPI, UPCitemdb identity, and the existing public-page scraper. Output stays shadow/internal. Alerts and history promotion remain disabled.

This is not a customer-facing feed. UPCitemdb is identity-only and must never be treated as retailer-price verification.

Canonical `source` is a structured object. `quantity` is observed shelf count (`inventory` / `inventoryCount` are aliases). `zip` is canonical (`zipcode` is the SQL alias). `channel` is `online` or `local`. See `docs/live-observation-contract.md`.

## Default safety posture

- Mode defaults to `dry-run`. Dry-run validates jobs and reports the plan with **zero** provider HTTP requests.
- Live mode requires explicit `--mode live` or `INGEST_MODE=live` plus configured server-side secret **names**.
- Provider selection is explicit. There is no implicit “run every provider” path.
- Conservative automation budget: 25 records/run and 250 records/month unless overridden downward or with an explicit cap.
- Concurrency defaults to 1. Timeouts, retries, Bright Data polls, and schedule cycles all have hard ceilings.
- Bright Data triggers are never retried (a retry would create a second billable snapshot). Snapshot polling is bounded and stops on `ready` or `failed`.
- Overlapping runs fail closed via an exclusive lock. A second unattended run skips instead of stacking cost.

## Secret names

Values never appear in preflight, logs, or CLI summaries. Configure these only in trusted server-side environment storage:

| Name | Provider | Required for live |
| --- | --- | --- |
| `BRIGHTDATA_API_TOKEN` | Bright Data | yes |
| `BRIGHTDATA_TEST_URL` | Bright Data | yes for smoke / live Home Depot jobs |
| `BRIGHTDATA_TEST_ZIP` | Bright Data | no (five-digit ZIP when local identity is required) |
| `RETAILERAPI_KEY` | RetailerAPI | yes |
| `RETAILERAPI_TEST_IDENTIFIER` | RetailerAPI | no |
| `UPCITEMDB_USER_KEY` | UPCitemdb paid lookup | yes |

Do not enable the UPCitemdb trial path from unattended automation. Trial still consumes the shared public quota.

## Start / dry-run

```sh
npm run ingest:preflight
npm run ingest:dry-run -- --providers retailerapi,brightdata,upcitemdb --jobs-file config/ingestion-jobs.example.json
```

Equivalent:

```sh
INGEST_PROVIDERS=retailerapi,brightdata,upcitemdb \
INGEST_JOBS_FILE=config/ingestion-jobs.example.json \
node scripts/ingest-once.js --mode dry-run
```

## Tests

```sh
node tests/live-ingestion.test.js
node tests/observation-contract.test.js
node tests/upcitemdb.test.js
node tests/ingestion-preflight.test.js
node tests/ingestion-runner.test.js
node tests/ingestion-schedule.test.js
node tests/brightdata-home-depot.test.js
node tests/retailerapi.test.js
node tests/retailer-scraper.test.js
npm test
```

## One-shot live run

Fail-closed if required secret names are missing. Cap the job file and keep Bright Data at one product until a snapshot is manually reviewed.

```sh
INGEST_MODE=live \
INGEST_PROVIDERS=retailerapi \
INGEST_JOBS_FILE=config/ingestion-jobs.example.json \
INGEST_MAX_RECORDS_PER_RUN=1 \
npm run ingest:once
```

Authenticated provider smokes (still one bounded request each, sanitized summary only):

```sh
npm run smoke:retailerapi
npm run smoke:brightdata
```

## Unattended scheduling

`npm run ingest:schedule` is one-shot unless `INGEST_INTERVAL_MS` and `INGEST_MAX_CYCLES` are both set. Cycles are capped at 24. Interval is capped at one hour. Overlap protection remains on.

Cron example (dry-run until secrets and a reviewed job file exist):

```cron
*/30 * * * * cd /opt/huntiq && INGEST_MODE=dry-run INGEST_PROVIDERS=retailerapi INGEST_JOBS_FILE=/opt/huntiq/config/ingestion-jobs.example.json npm run ingest:once >> /var/log/huntiq-ingest.log 2>&1
```

Optional cost/request environment:

| Name | Conservative default |
| --- | --- |
| `INGEST_MAX_RECORDS_PER_RUN` | 25 |
| `INGEST_MAX_RECORDS_PER_MONTH` | 250 |
| `INGEST_MONTH_TO_DATE_RECORDS` | 0 |
| `INGEST_MAX_CONCURRENCY` | 1 |
| `INGEST_TIMEOUT_MS` | 12000 |
| `INGEST_MAX_RETRIES` | 1 |
| `INGEST_MAX_CYCLES` | 1 |
| `INGEST_INTERVAL_MS` | unset / one-shot |
| `INGEST_LOCK_PATH` | OS temp `huntiq-ingestion` lock |
| `INGEST_STORE_DIR` | OS temp shadow JSON store |

## Rollback

1. Set `INGEST_MODE=dry-run` or stop the cron/systemd unit.
2. Leave alerts disabled. Do not promote shadow files into customer payloads.
3. Delete a stuck lock only after confirming no runner PID is alive: the lock file path from `INGEST_LOCK_PATH`.
4. Revert this branch/commit if the adapter itself is the problem. Schema `db/086_live_ingestion_runs.sql` is additive and unused until a database writer exists.

## Bright Data lifecycle

Trigger returns a snapshot id. Progress must echo that snapshot identity and one of `starting`, `running`, `ready`, `failed`. `error_message` is preserved on `failed`. Polling stops at a terminal state or the hard poll ceiling (8). Incomplete runs stay `shadow-running` and do not download.
