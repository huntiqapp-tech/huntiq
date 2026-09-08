'use strict';

const fs = require('fs');
const path = require('path');
const { reportIngestionPreflight } = require('../lib/ingestion-preflight');
const { runIngestion } = require('../lib/ingestion-runner');
const { createIngestionStore } = require('../lib/ingestion-store');
const { INGESTION_AUTOMATION_BUDGET, clampInt } = require('../lib/live-ingestion');

function arg(argv, name, fallback) {
  const prefix = `--${name}=`;
  const hit = argv.find((item) => item.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = argv.indexOf(`--${name}`);
  if (idx >= 0) return argv[idx + 1];
  return fallback;
}

function flag(argv, name) {
  return argv.includes(`--${name}`);
}

function loadJobs(filePath) {
  if (!filePath) return [];
  const resolved = path.resolve(filePath);
  const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  return Array.isArray(parsed) ? parsed : parsed.jobs || [];
}

function credentialsFromEnv(env) {
  return {
    brightdataToken: env.BRIGHTDATA_API_TOKEN,
    retailerapiKey: env.RETAILERAPI_KEY,
    upcitemdbUserKey: env.UPCITEMDB_USER_KEY
  };
}

async function runIngestOnce({
  argv = process.argv.slice(2),
  env = process.env,
  fetchImpl = globalThis.fetch,
  stdout = console.log,
  stderr = console.error
} = {}) {
  const mode = arg(argv, 'mode', env.INGEST_MODE || 'dry-run');
  const providers = arg(argv, 'providers', env.INGEST_PROVIDERS);
  const jobsFile = arg(argv, 'jobs-file', env.INGEST_JOBS_FILE);
  const preflight = reportIngestionPreflight({ env, providers, mode });
  const jobs = loadJobs(jobsFile);

  if (!providers) {
    stderr(JSON.stringify({ ok: false, code: 'fail-closed', message: 'explicit --providers or INGEST_PROVIDERS is required' }));
    return 1;
  }

  if (String(mode).toLowerCase() === 'live' && preflight.failClosed && !flag(argv, 'allow-partial')) {
    stderr(JSON.stringify({
      ok: false,
      code: 'fail-closed',
      message: 'live ingestion requires configured secret names for the selected providers',
      missingRequiredNames: preflight.missingRequiredNames,
      configuredNames: preflight.configuredNames
    }));
    return 1;
  }

  const result = await runIngestion({
    providers,
    jobs,
    mode,
    credentials: credentialsFromEnv(env),
    env,
    fetchImpl,
    budget: {
      maxRecordsPerRun: clampInt(arg(argv, 'max-records', env.INGEST_MAX_RECORDS_PER_RUN), { min: 0, max: 100, fallback: INGESTION_AUTOMATION_BUDGET.maxRecordsPerRun }),
      maxRecordsPerMonth: clampInt(env.INGEST_MAX_RECORDS_PER_MONTH, { min: 0, max: 1000, fallback: INGESTION_AUTOMATION_BUDGET.maxRecordsPerMonth })
    },
    monthToDateRecords: clampInt(env.INGEST_MONTH_TO_DATE_RECORDS, { min: 0, max: 1000, fallback: 0 }),
    concurrency: clampInt(arg(argv, 'concurrency', env.INGEST_MAX_CONCURRENCY), { min: 1, max: 4, fallback: 1 }),
    timeoutMs: clampInt(env.INGEST_TIMEOUT_MS, { min: 250, max: 30000, fallback: 12000 }),
    maxRetries: clampInt(env.INGEST_MAX_RETRIES, { min: 0, max: 2, fallback: 1 }),
    lockPath: arg(argv, 'lock-path', env.INGEST_LOCK_PATH),
    store: createIngestionStore({ directory: arg(argv, 'store-dir', env.INGEST_STORE_DIR) })
  });

  stdout(JSON.stringify({
    ok: result.ok,
    runId: result.runId,
    mode: result.mode,
    providers: result.providers,
    requestCount: result.requestCount,
    acceptedCount: result.acceptedCount,
    identityCount: result.identityCount,
    rejectedCount: result.rejectedCount,
    duplicateCount: result.duplicateCount,
    skippedCount: result.skippedCount,
    overlapSkipped: result.overlapSkipped,
    failClosed: result.failClosed,
    partial: result.partial,
    validationState: result.validationState,
    alertsEnabled: result.alertsEnabled,
    historyPromotionAllowed: result.historyPromotionAllowed,
    rejected: result.rejected,
    configuredNames: result.preflight?.configuredNames,
    missingNames: result.preflight?.missingNames
  }, null, 2));

  return !result.ok && !result.overlapSkipped ? 1 : 0;
}

if (require.main === module) {
  runIngestOnce().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    console.error(JSON.stringify({ ok: false, name: error.name, message: error.message }));
    process.exitCode = 1;
  });
}

module.exports = { credentialsFromEnv, loadJobs, runIngestOnce };
