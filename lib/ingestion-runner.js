'use strict';

const crypto = require('crypto');
const {
  INGESTION_AUTOMATION_BUDGET,
  attachObservationAliases,
  enforceUsageBudget,
  jobFingerprint,
  observationFingerprint,
  redactSecrets,
  sanitizeIngestionError
} = require('./live-ingestion');
const { reportIngestionPreflight, KNOWN_PROVIDERS } = require('./ingestion-preflight');
const { fetchWithRetry, runWithConcurrency, resolveConcurrency, resolveTimeoutMs, resolveMaxRetries, resolveRetryDelayMs } = require('./ingestion-http');
const { collectHomeDepotShadowSnapshot, planHomeDepotTrigger } = require('./brightdata-home-depot');
const { buildProductLookupRequest, lookupProduct, prepareRetailerApiIngestion } = require('./retailerapi');
const { lookupUpcIdentity, buildUpcItemDbLookupRequest } = require('./upcitemdb');
const { runRetailerScrapeBatch } = require('./retailer-scrape-batch');
const { acquireIngestionLock, releaseIngestionLock } = require('./ingestion-lock');

const DEFAULT_IDEMPOTENCY_TTL_MS = 6 * 60 * 60 * 1000;
const HARD_MAX_JOBS = 100;
const LIVE_HARD_FAILURE_REASONS = new Set([
  'malformed-job',
  'missing-credentials',
  'provider-error',
  'rate-limit',
  'timeout',
  'unsupported-provider'
]);

function cleanProviders(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(list.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))];
}

function knownSecretsFrom(credentials = {}) {
  return [credentials.brightdataToken, credentials.retailerapiKey, credentials.upcitemdbUserKey].filter(Boolean);
}

function makeRunId(now) {
  return `ing_${new Date(now).toISOString().replace(/[:.]/g, '-')}_${crypto.randomBytes(4).toString('hex')}`;
}

function normalizeJobs(jobs = [], providers) {
  if (!Array.isArray(jobs)) throw new Error('ingestion jobs must be an array');
  return jobs.map((job, index) => {
    const provider = String(job?.provider || (providers.length === 1 ? providers[0] : '')).trim().toLowerCase();
    return { ...job, provider, index };
  });
}

function isFreshIdempotentHit(record, now, ttlMs) {
  if (!record?.storedAt) return false;
  const stored = Date.parse(record.storedAt);
  return Number.isFinite(stored) && now - stored >= 0 && now - stored <= ttlMs;
}

function shadowEnvelope(extra = {}) {
  return {
    validationState: extra.validationState || 'shadow',
    alertsEnabled: false,
    historyPromotionAllowed: false,
    redistributable: false,
    ...extra
  };
}

async function runProviderJob(job, context) {
  const { mode, credentials, fetchImpl, timeoutMs, maxRetries, maxRetryDelayMs, sleep, observedAt, budget, monthToDateRecords } = context;
  const provider = job.provider;
  const secrets = knownSecretsFrom(credentials);

  if (mode === 'dry-run') {
    if (provider === 'brightdata') planHomeDepotTrigger({ products: [{ url: job.url, zip: job.zip || job.zipcode }] });
    if (provider === 'upcitemdb') buildUpcItemDbLookupRequest({ userKey: 'dry-run-placeholder', upc: job.upc || job.identifier, useTrial: false });
    if (provider === 'retailerapi') buildProductLookupRequest({
      apiKey: 'dry-run-placeholder',
      identifier: job.identifier || job.upc,
      includeCrossRetailer: job.includeCrossRetailer !== false,
      retailer: job.retailer,
      forceRefresh: Boolean(job.forceRefresh)
    });
    return shadowEnvelope({
      ok: true,
      dryRun: true,
      provider,
      planned: true,
      observations: [],
      identities: [],
      requestCount: 0
    });
  }

  if (provider === 'brightdata') {
    if (!credentials.brightdataToken) {
      return shadowEnvelope({ ok: false, skipped: true, reason: 'missing-credentials', provider, requestCount: 0 });
    }
    const result = await collectHomeDepotShadowSnapshot({
      apiToken: credentials.brightdataToken,
      products: [{ url: job.url, zip: job.zip || job.zipcode }],
      monthToDateRecords,
      budget,
      fetchImpl,
      maxPolls: job.maxPolls,
      pollDelayMs: job.pollDelayMs || 0,
      sleep,
      observedAt,
      timeoutMs
    });
    return shadowEnvelope({
      ...result,
      provider: 'brightdata',
      observations: result.observations || [],
      identities: [],
      requestCount: (result.requestCount || 0) + (result.pollCount || 0) + (result.ready ? 1 : 0)
    });
  }

  if (provider === 'retailerapi') {
    if (!credentials.retailerapiKey) {
      return shadowEnvelope({ ok: false, skipped: true, reason: 'missing-credentials', provider, requestCount: 0 });
    }
    const wrappedFetch = async (url, options) => fetchWithRetry(fetchImpl, url, options, {
      timeoutMs,
      maxRetries,
      maxRetryDelayMs,
      sleep,
      knownSecrets: secrets
    });
    const product = await lookupProduct({
      apiKey: credentials.retailerapiKey,
      identifier: job.identifier || job.upc,
      includeCrossRetailer: job.includeCrossRetailer !== false,
      retailer: job.retailer,
      fetchImpl: wrappedFetch
    });
    const ingestion = prepareRetailerApiIngestion(product, { retrievedAt: observedAt, retailer: job.retailer });
    return shadowEnvelope({
      ok: true,
      provider: 'retailerapi',
      observations: ingestion.observations,
      rejected: ingestion.rejected,
      identities: [],
      requestCount: 1,
      rawAudit: ingestion.rawAudit
    });
  }

  if (provider === 'upcitemdb') {
    if (!credentials.upcitemdbUserKey) {
      return shadowEnvelope({ ok: false, skipped: true, reason: 'missing-credentials', provider, requestCount: 0 });
    }
    const result = await lookupUpcIdentity({
      userKey: credentials.upcitemdbUserKey,
      upc: job.upc || job.identifier,
      useTrial: false,
      fetchImpl,
      timeoutMs,
      maxRetries,
      maxRetryDelayMs,
      sleep,
      retrievedAt: observedAt
    });
    return shadowEnvelope({
      ok: true,
      provider: 'upcitemdb',
      observations: [],
      identities: result.identities,
      rejected: result.rejected,
      requestCount: 1,
      retailerPriceVerification: false,
      priceAuthority: false
    });
  }

  if (provider === 'scraper') {
    const batch = await runRetailerScrapeBatch([{
      retailer: job.retailer,
      url: job.url,
      zip: job.zip,
      storeId: job.storeId,
      channel: job.channel,
      observedAt
    }], {
      fetchImpl,
      asOf: observedAt,
      budget,
      monthToDateRecords
    });
    return shadowEnvelope({
      ok: batch.rejectedCount === 0,
      provider: 'scraper',
      observations: batch.observations,
      rejected: batch.rejected,
      identities: [],
      requestCount: batch.rejected.some((row) => row.reason === 'unsupported-retailer-adapter') ? 0 : 1
    });
  }

  return shadowEnvelope({ ok: false, skipped: true, reason: 'unsupported-provider', provider, requestCount: 0 });
}

async function runIngestion({
  providers,
  jobs = [],
  mode = 'dry-run',
  credentials = {},
  env = process.env,
  fetchImpl = globalThis.fetch,
  concurrency,
  timeoutMs,
  maxRetries,
  maxRetryDelayMs,
  budget = INGESTION_AUTOMATION_BUDGET,
  monthToDateRecords = 0,
  observedAt,
  now = Date.now(),
  sleep,
  lock = true,
  lockPath,
  store = null,
  idempotencyTtlMs = DEFAULT_IDEMPOTENCY_TTL_MS
} = {}) {
  const startedAt = new Date(now).toISOString();
  const runId = makeRunId(now);
  const selected = cleanProviders(providers);
  const resolvedMode = String(mode).trim().toLowerCase() === 'live' ? 'live' : 'dry-run';
  const secrets = knownSecretsFrom(credentials);
  const preflight = reportIngestionPreflight({ env, providers: selected, mode: resolvedMode });
  const base = shadowEnvelope({
    ok: false,
    runId,
    mode: resolvedMode,
    providers: selected,
    startedAt,
    requestedCount: Array.isArray(jobs) ? jobs.length : 0,
    requestCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
    skippedCount: 0,
    observations: [],
    identities: [],
    rejected: [],
    processedJobs: [],
    preflight,
    failClosed: false,
    overlapSkipped: false
  });

  if (!selected.length) {
    return redactSecrets({ ...base, failClosed: true, error: sanitizeIngestionError('explicit provider selection is required') }, secrets);
  }
  const unknown = selected.filter((name) => !KNOWN_PROVIDERS.includes(name));
  if (unknown.length) {
    return redactSecrets({ ...base, failClosed: true, error: sanitizeIngestionError(`unsupported providers: ${unknown.join(',')}`) }, secrets);
  }
  if (resolvedMode === 'live') {
    const credentialed = selected.some((provider) => (
      provider === 'scraper'
      || (provider === 'brightdata' && credentials.brightdataToken)
      || (provider === 'retailerapi' && credentials.retailerapiKey)
      || (provider === 'upcitemdb' && credentials.upcitemdbUserKey)
    ));
    if (!credentialed) {
      return redactSecrets({
        ...base,
        failClosed: true,
        error: sanitizeIngestionError('live ingestion is fail-closed until required secret names are configured')
      }, secrets);
    }
  }

  let lockHandle = null;
  if (lock) {
    lockHandle = acquireIngestionLock({ lockPath, now });
    if (!lockHandle.acquired) {
      return redactSecrets({
        ...base,
        ok: true,
        overlapSkipped: true,
        skippedCount: base.requestedCount,
        completedAt: new Date(now).toISOString(),
        error: { ok: false, code: 'overlap', message: 'another ingestion run is already active' }
      }, secrets);
    }
  }

  try {
    const allNormalized = normalizeJobs(jobs, selected);
    const normalized = allNormalized.filter((job) => selected.includes(job.provider));
    const ignoredJobs = allNormalized.filter((job) => !selected.includes(job.provider));
    const usage = enforceUsageBudget({
      requestedRecords: normalized.length,
      monthToDateRecords,
      budget
    });
    const capped = normalized.slice(0, Math.min(usage.allowedRecords, HARD_MAX_JOBS));
    const overCap = normalized.slice(capped.length).map((job) => ({
      index: job.index,
      provider: job.provider,
      reason: 'record-cap',
      fingerprint: jobFingerprint(job)
    }));

    const observations = [];
    const identities = [];
    const rejected = [
      ...ignoredJobs.map((job) => ({
        index: job.index,
        provider: job.provider,
        reason: 'unselected-provider'
      })),
      ...overCap
    ];
    const processedJobs = [];
    const seenJobs = new Set();
    const seenObservations = new Set();
    let requestCount = 0;
    let duplicateCount = 0;
    let skippedCount = ignoredJobs.length + overCap.length;

    const worker = async (job) => {
      let fingerprint;
      try {
        fingerprint = jobFingerprint(job);
      } catch (error) {
        rejected.push({ index: job.index, provider: job.provider, reason: 'malformed-job', error: sanitizeIngestionError(error, { knownSecrets: secrets }) });
        skippedCount += 1;
        return;
      }

      if (seenJobs.has(fingerprint)) {
        duplicateCount += 1;
        rejected.push({ index: job.index, provider: job.provider, reason: 'duplicate-job', fingerprint });
        return;
      }
      seenJobs.add(fingerprint);

      const prior = store?.lookupJob?.(fingerprint);
      if (prior && isFreshIdempotentHit(prior, now, idempotencyTtlMs)) {
        duplicateCount += 1;
        rejected.push({ index: job.index, provider: job.provider, reason: 'idempotent-replay', fingerprint, priorRunId: prior.runId });
        return;
      }

      if (resolvedMode === 'live') {
        const needed = {
          brightdata: 'BRIGHTDATA_API_TOKEN',
          retailerapi: 'RETAILERAPI_KEY',
          upcitemdb: 'UPCITEMDB_USER_KEY'
        }[job.provider];
        const present = {
          brightdata: credentials.brightdataToken,
          retailerapi: credentials.retailerapiKey,
          upcitemdb: credentials.upcitemdbUserKey,
          scraper: true
        }[job.provider];
        if (needed && !present) {
          skippedCount += 1;
          rejected.push({ index: job.index, provider: job.provider, reason: 'missing-credentials', secretName: needed });
          return;
        }
      }

      try {
        const result = await runProviderJob(job, {
          mode: resolvedMode,
          credentials,
          fetchImpl,
          timeoutMs: resolveTimeoutMs(timeoutMs),
          maxRetries: resolveMaxRetries(maxRetries),
          maxRetryDelayMs: resolveRetryDelayMs(maxRetryDelayMs),
          sleep,
          observedAt: observedAt || startedAt,
          budget,
          monthToDateRecords
        });
        requestCount += Number(result.requestCount || 0);

        if (result.skipped) {
          skippedCount += 1;
          rejected.push({ index: job.index, provider: job.provider, reason: result.reason, fingerprint });
          return;
        }

        if (result.ok === false) {
          rejected.push({
            index: job.index,
            provider: job.provider,
            reason: 'provider-error',
            status: result.status || 'failed',
            errorMessage: result.errorMessage || result.error || null,
            fingerprint
          });
        }

        for (const observation of result.observations || []) {
          const canonical = attachObservationAliases(observation);
          const key = observationFingerprint(canonical);
          if (seenObservations.has(key)) {
            duplicateCount += 1;
            continue;
          }
          seenObservations.add(key);
          observations.push(canonical);
        }
        for (const identity of result.identities || []) identities.push(identity);
        for (const row of result.rejected || []) rejected.push({ index: job.index, provider: job.provider, ...row });
        processedJobs.push({
          index: job.index,
          provider: job.provider,
          fingerprint,
          observationCount: (result.observations || []).length,
          identityCount: (result.identities || []).length,
          dryRun: Boolean(result.dryRun)
        });
      } catch (error) {
        skippedCount += 1;
        rejected.push({
          index: job.index,
          provider: job.provider,
          reason: error?.code === 'timeout' ? 'timeout' : error?.status === 429 || error?.code === 'rate-limit' ? 'rate-limit' : 'provider-error',
          fingerprint,
          error: sanitizeIngestionError(error, { knownSecrets: secrets })
        });
      }
    };

    await runWithConcurrency(capped, worker, resolveConcurrency(concurrency));

    const completedAt = new Date(typeof now === 'number' ? now : Date.now()).toISOString();
    const hardFailures = rejected.filter((row) => LIVE_HARD_FAILURE_REASONS.has(row.reason));
    const nonBenignRejections = rejected.filter((row) => !['duplicate-job', 'idempotent-replay', 'record-cap'].includes(row.reason));
    const evidenceCount = observations.length + identities.length;
    const failClosed = resolvedMode === 'live' && hardFailures.length > 0;
    const result = redactSecrets(shadowEnvelope({
      ok: resolvedMode === 'dry-run' || hardFailures.length === 0,
      runId,
      mode: resolvedMode,
      providers: selected,
      startedAt,
      completedAt,
      requestedCount: jobs.length,
      requestCount,
      acceptedCount: observations.length,
      identityCount: identities.length,
      rejectedCount: rejected.length,
      duplicateCount,
      skippedCount,
      partial: resolvedMode === 'live' && nonBenignRejections.length > 0 && evidenceCount > 0,
      usage,
      observations,
      identities,
      rejected,
      processedJobs,
      preflight,
      failClosed,
      overlapSkipped: false
    }), secrets);

    if (resolvedMode === 'dry-run') result.ok = true;
    if (store?.saveRun && resolvedMode === 'live') store.saveRun(result);
    return result;
  } finally {
    if (lockHandle?.acquired) releaseIngestionLock(lockHandle.lockPath);
  }
}

module.exports = {
  HARD_MAX_JOBS,
  DEFAULT_IDEMPOTENCY_TTL_MS,
  runIngestion
};
