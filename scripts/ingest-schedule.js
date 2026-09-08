'use strict';

const fs = require('fs');
const path = require('path');
const { reportIngestionPreflight } = require('../lib/ingestion-preflight');
const { runScheduledIngestion } = require('../lib/ingestion-schedule');
const { createIngestionStore } = require('../lib/ingestion-store');
const { INGESTION_AUTOMATION_BUDGET, clampInt } = require('../lib/live-ingestion');

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return fallback;
}

function loadJobs(filePath) {
  if (!filePath) return [];
  const parsed = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  return Array.isArray(parsed) ? parsed : parsed.jobs || [];
}

(async () => {
  const env = process.env;
  const mode = arg('mode', env.INGEST_MODE || 'dry-run');
  const providers = arg('providers', env.INGEST_PROVIDERS);
  const preflight = reportIngestionPreflight({ env, providers, mode });

  if (!providers) {
    console.error(JSON.stringify({ ok: false, code: 'fail-closed', message: 'explicit --providers or INGEST_PROVIDERS is required' }));
    process.exitCode = 1;
    return;
  }

  if (String(mode).toLowerCase() === 'live' && preflight.failClosed) {
    console.error(JSON.stringify({
      ok: false,
      code: 'fail-closed',
      message: 'unattended live ingestion requires configured secret names',
      missingRequiredNames: preflight.missingRequiredNames,
      configuredNames: preflight.configuredNames
    }));
    process.exitCode = 1;
    return;
  }

  const result = await runScheduledIngestion({
    providers,
    jobs: loadJobs(arg('jobs-file', env.INGEST_JOBS_FILE)),
    mode,
    credentials: {
      brightdataToken: env.BRIGHTDATA_API_TOKEN,
      retailerapiKey: env.RETAILERAPI_KEY,
      upcitemdbUserKey: env.UPCITEMDB_USER_KEY
    },
    env,
    once: arg('interval-ms', env.INGEST_INTERVAL_MS) ? false : true,
    intervalMs: clampInt(arg('interval-ms', env.INGEST_INTERVAL_MS), { min: 0, max: 3600000, fallback: 0 }),
    maxCycles: clampInt(arg('max-cycles', env.INGEST_MAX_CYCLES), { min: 1, max: 24, fallback: 1 }),
    budget: {
      maxRecordsPerRun: clampInt(env.INGEST_MAX_RECORDS_PER_RUN, { min: 0, max: 100, fallback: INGESTION_AUTOMATION_BUDGET.maxRecordsPerRun }),
      maxRecordsPerMonth: clampInt(env.INGEST_MAX_RECORDS_PER_MONTH, { min: 0, max: 1000, fallback: INGESTION_AUTOMATION_BUDGET.maxRecordsPerMonth })
    },
    monthToDateRecords: clampInt(env.INGEST_MONTH_TO_DATE_RECORDS, { min: 0, max: 1000, fallback: 0 }),
    concurrency: 1,
    lockPath: arg('lock-path', env.INGEST_LOCK_PATH),
    store: createIngestionStore({ directory: arg('store-dir', env.INGEST_STORE_DIR) })
  });

  console.log(JSON.stringify({
    ok: result.ok,
    runCount: result.runCount,
    schedule: result.schedule,
    alertsEnabled: false,
    historyPromotionAllowed: false,
    runs: result.runs.map((run) => ({
      cycle: run.cycle,
      ok: run.ok,
      runId: run.runId,
      requestCount: run.requestCount,
      acceptedCount: run.acceptedCount,
      rejectedCount: run.rejectedCount,
      overlapSkipped: run.overlapSkipped,
      failClosed: run.failClosed
    }))
  }, null, 2));

  if (!result.ok) process.exitCode = 1;
})().catch((error) => {
  console.error(JSON.stringify({ ok: false, name: error.name, message: error.message }));
  process.exitCode = 1;
});
