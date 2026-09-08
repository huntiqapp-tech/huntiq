'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const retailerFixture = require('./fixtures/retailerapi-product.json');
const upcFixture = require('./fixtures/upcitemdb-lookup.json');
const brightFixture = require('./fixtures/brightdata-home-depot-snapshot.json');
const { runIngestion } = require('../lib/ingestion-runner');
const { acquireIngestionLock, releaseIngestionLock } = require('../lib/ingestion-lock');
const { createIngestionStore } = require('../lib/ingestion-store');
const { HOME_DEPOT_DATASET_ID } = require('../lib/brightdata-home-depot');

function jsonResponse(payload, { ok = true, status = 200, headerMap = {} } = {}) {
  return {
    ok,
    status,
    headers: { get: (name) => headerMap[String(name).toLowerCase()] || null },
    json: async () => payload
  };
}

function tempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `huntiq-${name}-`));
}

function retailerFetch() {
  return async () => jsonResponse(retailerFixture);
}

function upcFetch() {
  return async () => jsonResponse(upcFixture);
}

function brightFetch({ status = 'ready', errorMessage, hang = false, calls } = {}) {
  let progress = 0;
  return async (url) => {
    if (calls) calls.push(url);
    if (hang) return new Promise(() => {});
    if (String(url).includes('/trigger')) return jsonResponse({ snapshot_id: 's_ingest123' });
    if (String(url).includes('/progress/')) {
      progress += 1;
      const current = typeof status === 'function' ? status(progress) : status;
      const payload = { snapshot_id: 's_ingest123', dataset_id: HOME_DEPOT_DATASET_ID, status: current };
      if (errorMessage) payload.error_message = errorMessage;
      return jsonResponse(payload);
    }
    return jsonResponse(brightFixture);
  };
}

(async () => {
  const lockDir = tempDir('lock');
  const storeDir = tempDir('store');

  const dryRun = await runIngestion({
    providers: ['retailerapi', 'brightdata', 'upcitemdb'],
    jobs: [
      { provider: 'retailerapi', identifier: '19667262713' },
      { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' },
      { provider: 'upcitemdb', upc: '012345678905' }
    ],
    mode: 'dry-run',
    lockPath: path.join(lockDir, 'dry.lock'),
    fetchImpl: async () => { throw new Error('dry-run must not fetch'); }
  });
  assert.equal(dryRun.ok, true);
  assert.equal(dryRun.mode, 'dry-run');
  assert.equal(dryRun.requestCount, 0);
  assert.equal(dryRun.alertsEnabled, false);
  assert.equal(dryRun.historyPromotionAllowed, false);
  assert.equal(dryRun.processedJobs.length, 3);

  const success = await runIngestion({
    providers: ['retailerapi', 'upcitemdb'],
    jobs: [
      { provider: 'retailerapi', identifier: '19667262713' },
      { provider: 'upcitemdb', upc: '012345678905' }
    ],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key', upcitemdbUserKey: 'upc-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key', UPCITEMDB_USER_KEY: 'upc-secret-key' },
    lockPath: path.join(lockDir, 'success.lock'),
    store: createIngestionStore({ directory: storeDir }),
    observedAt: '2026-09-02T19:00:00Z',
    fetchImpl: async (url) => String(url).includes('upcitemdb') ? upcFetch()() : retailerFetch()()
  });
  assert.equal(success.ok, true);
  assert.ok(success.observations.length >= 1);
  assert.equal(success.identities.length, 1);
  assert.equal(success.identities[0].priceAuthority, false);
  assert.equal(success.identities[0].retailerPriceVerification, false);
  assert.ok(success.observations.every((row) => row.channel === 'online' || row.zip || row.storeId));
  assert.ok(!JSON.stringify(success).includes('retailer-secret-key'));
  assert.ok(!JSON.stringify(success).includes('upc-secret-key'));

  const malformed = await runIngestion({
    providers: ['retailerapi'],
    jobs: [{ provider: 'retailerapi', identifier: '19667262713' }],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    lockPath: path.join(lockDir, 'malformed.lock'),
    fetchImpl: async () => jsonResponse({ title: 'no identity' })
  });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.failClosed, true);
  assert.ok(malformed.rejected.some((row) => row.reason === 'provider-error'));

  const missing = await runIngestion({
    providers: ['brightdata'],
    jobs: [{ provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' }],
    mode: 'live',
    credentials: {},
    env: {},
    lockPath: path.join(lockDir, 'missing.lock'),
    fetchImpl: async () => { throw new Error('missing credentials must not fetch'); }
  });
  assert.equal(missing.failClosed, true);
  assert.equal(missing.ok, false);
  assert.equal(missing.requestCount, 0);

  const rateLimited = await runIngestion({
    providers: ['retailerapi'],
    jobs: [{ provider: 'retailerapi', identifier: '19667262713' }],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    maxRetries: 0,
    lockPath: path.join(lockDir, 'rate.lock'),
    fetchImpl: async () => jsonResponse({ error: 'slow', code: 'EXCEED_LIMIT' }, { ok: false, status: 429, headerMap: { 'retry-after': '1' } })
  });
  assert.ok(rateLimited.rejected.some((row) => row.reason === 'rate-limit'));
  assert.equal(rateLimited.ok, false);
  assert.equal(rateLimited.failClosed, true);
  assert.ok(!JSON.stringify(rateLimited).includes('retailer-secret-key'));

  const retried = await runIngestion({
    providers: ['retailerapi'],
    jobs: [{ provider: 'retailerapi', identifier: '19667262713' }],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    maxRetries: 1,
    maxRetryDelayMs: 1,
    sleep: async () => {},
    lockPath: path.join(lockDir, 'retry.lock'),
    observedAt: '2026-09-02T19:00:00Z',
    fetchImpl: (() => {
      let calls = 0;
      return async () => {
        calls += 1;
        if (calls === 1) return jsonResponse({ error: 'slow' }, { ok: false, status: 429, headerMap: { 'retry-after': '1' } });
        return jsonResponse(retailerFixture);
      };
    })()
  });
  assert.ok(retried.observations.length >= 1);

  const timedOut = await runIngestion({
    providers: ['retailerapi'],
    jobs: [{ provider: 'retailerapi', identifier: '19667262713' }],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    timeoutMs: 250,
    maxRetries: 0,
    lockPath: path.join(lockDir, 'timeout.lock'),
    fetchImpl: async () => new Promise(() => {})
  });
  assert.ok(timedOut.rejected.some((row) => row.reason === 'timeout'));

  const providerError = await runIngestion({
    providers: ['retailerapi'],
    jobs: [{ provider: 'retailerapi', identifier: '19667262713' }],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    lockPath: path.join(lockDir, 'forbidden.lock'),
    fetchImpl: async () => jsonResponse({ error: 'revoked', code: 'forbidden' }, { ok: false, status: 403 })
  });
  assert.ok(providerError.rejected.some((row) => row.reason === 'provider-error'));
  assert.equal(providerError.ok, false);
  assert.equal(providerError.failClosed, true);

  const partial = await runIngestion({
    providers: ['retailerapi'],
    jobs: [
      { provider: 'retailerapi', identifier: '19667262713' },
      { provider: 'retailerapi', identifier: 'bad-id' }
    ],
    mode: 'live',
    credentials: { retailerapiKey: 'retailer-secret-key' },
    env: { RETAILERAPI_KEY: 'retailer-secret-key' },
    maxRetries: 0,
    lockPath: path.join(lockDir, 'partial.lock'),
    observedAt: '2026-09-02T19:00:00Z',
    fetchImpl: async (url) => {
      if (String(url).includes('bad-id')) return jsonResponse({ error: 'nope' }, { ok: false, status: 500 });
      return jsonResponse(retailerFixture);
    }
  });
  assert.equal(partial.ok, false);
  assert.equal(partial.partial, true);
  assert.equal(partial.failClosed, true);
  assert.ok(partial.observations.length >= 1);
  assert.ok(partial.rejected.some((row) => row.reason === 'provider-error' || row.reason === 'rate-limit'));

  const capped = await runIngestion({
    providers: ['upcitemdb'],
    jobs: [
      { provider: 'upcitemdb', upc: '012345678905' },
      { provider: 'upcitemdb', upc: '012345678906' }
    ],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    budget: { maxRecordsPerRun: 1, maxRecordsPerMonth: 10 },
    lockPath: path.join(lockDir, 'cap.lock'),
    fetchImpl: upcFetch()
  });
  assert.equal(capped.usage.allowedRecords, 1);
  assert.ok(capped.rejected.some((row) => row.reason === 'record-cap'));
  assert.equal(capped.identities.length, 1);

  const duplicates = await runIngestion({
    providers: ['upcitemdb'],
    jobs: [
      { provider: 'upcitemdb', upc: '012345678905' },
      { provider: 'upcitemdb', upc: '012345678905' }
    ],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    lockPath: path.join(lockDir, 'dup.lock'),
    fetchImpl: upcFetch()
  });
  assert.equal(duplicates.duplicateCount, 1);
  assert.ok(duplicates.rejected.some((row) => row.reason === 'duplicate-job'));

  const zipAliasDup = await runIngestion({
    providers: ['brightdata'],
    jobs: [
      { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' },
      { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zipcode: '18360' }
    ],
    mode: 'dry-run',
    lockPath: path.join(lockDir, 'zip-alias.lock'),
    fetchImpl: async () => { throw new Error('zip alias duplicate must not fetch'); }
  });
  assert.equal(zipAliasDup.duplicateCount, 1);
  assert.ok(zipAliasDup.rejected.some((row) => row.reason === 'duplicate-job' && String(row.fingerprint).includes('zip:18360')));

  const zipDistinct = await runIngestion({
    providers: ['brightdata'],
    jobs: [
      { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' },
      { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zipcode: '18064' }
    ],
    mode: 'dry-run',
    lockPath: path.join(lockDir, 'zip-distinct.lock'),
    fetchImpl: async () => { throw new Error('distinct ZIP jobs must not fetch'); }
  });
  assert.equal(zipDistinct.duplicateCount, 0);
  assert.equal(zipDistinct.processedJobs.length, 2);

  const store = createIngestionStore({ directory: path.join(storeDir, 'replay') });
  store.rememberJob('upcitemdb|012345678905|online|', {
    runId: 'ing_prior',
    provider: 'upcitemdb',
    storedAt: '2026-09-07T12:00:00Z',
    observationCount: 0
  });
  const replay = await runIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    now: Date.parse('2026-09-07T13:00:00Z'),
    store,
    lockPath: path.join(lockDir, 'replay.lock'),
    fetchImpl: async () => { throw new Error('idempotent replay must not fetch'); }
  });
  assert.ok(replay.rejected.some((row) => row.reason === 'idempotent-replay'));
  assert.equal(replay.requestCount, 0);

  const lockPath = path.join(lockDir, 'overlap.lock');
  const held = acquireIngestionLock({ lockPath });
  assert.equal(held.acquired, true);
  const overlapped = await runIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    lockPath,
    fetchImpl: async () => { throw new Error('overlap must not fetch'); }
  });
  assert.equal(overlapped.overlapSkipped, true);
  assert.equal(overlapped.requestCount, 0);
  releaseIngestionLock(lockPath);

  const brightCalls = [];
  const bright = await runIngestion({
    providers: ['brightdata'],
    jobs: [{ provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360', pollDelayMs: 0 }],
    mode: 'live',
    credentials: { brightdataToken: 'bright-secret-token' },
    env: { BRIGHTDATA_API_TOKEN: 'bright-secret-token', BRIGHTDATA_TEST_URL: 'https://www.homedepot.com/p/example/100000001' },
    lockPath: path.join(lockDir, 'bright.lock'),
    observedAt: '2026-09-07T12:00:00Z',
    fetchImpl: brightFetch({ status: (n) => (n === 1 ? 'starting' : n === 2 ? 'running' : 'ready'), calls: brightCalls })
  });
  assert.equal(bright.ok, true);
  assert.equal(bright.observations[0].zip, '18360');
  assert.equal(bright.observations[0].channel, 'local');
  assert.equal(bright.observations[0].source.provider, 'bright-data');
  assert.ok(!JSON.stringify(bright).includes('bright-secret-token'));

  const brightFailed = await runIngestion({
    providers: ['brightdata'],
    jobs: [{ provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' }],
    mode: 'live',
    credentials: { brightdataToken: 'bright-secret-token' },
    env: { BRIGHTDATA_API_TOKEN: 'bright-secret-token' },
    lockPath: path.join(lockDir, 'bright-fail.lock'),
    fetchImpl: brightFetch({ status: 'failed', errorMessage: 'dataset exploded' })
  });
  assert.ok(brightFailed.rejected.some((row) => row.errorMessage === 'dataset exploded' || row.reason === 'provider-error'));
  assert.equal(brightFailed.ok, false);
  assert.equal(brightFailed.failClosed, true);

  const noProviders = await runIngestion({ providers: [], jobs: [], mode: 'dry-run', lock: false });
  assert.equal(noProviders.failClosed, true);

  const dryStore = createIngestionStore({ directory: path.join(storeDir, 'dry-then-live') });
  await runIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'dry-run',
    store: dryStore,
    lockPath: path.join(lockDir, 'dry-store.lock'),
    fetchImpl: async () => { throw new Error('dry-run must not fetch'); }
  });
  const liveAfterDry = await runIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    store: dryStore,
    lockPath: path.join(lockDir, 'live-after-dry.lock'),
    fetchImpl: upcFetch()
  });
  assert.equal(liveAfterDry.requestCount, 1);
  assert.ok(!liveAfterDry.rejected.some((row) => row.reason === 'idempotent-replay'));

  console.log('ingestion-runner tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
