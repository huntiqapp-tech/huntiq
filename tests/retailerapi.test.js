'use strict';

const assert = require('assert');
const fixture = require('./fixtures/retailerapi-product.json');
const {
  RetailerApiError,
  buildProductLookupRequest,
  safeRequestLog,
  lookupProduct,
  freshnessState,
  normalizeRetailerApiProduct,
  dedupeRetailerApiObservations,
  prepareRetailerApiIngestion
} = require('../lib/retailerapi');

(async () => {
  const request = buildProductLookupRequest({ apiKey: 'unit-test-secret', identifier: fixture.item_id });
  assert(request.url.includes(`/products/${fixture.item_id}`));
  assert(request.url.includes('include_cross_retailer=true'));
  assert.equal(request.headers.Authorization, 'Bearer unit-test-secret');
  const logged = safeRequestLog(request);
  assert.equal(logged.headers.Authorization, '[REDACTED]');
  assert(!JSON.stringify(logged).includes('test-secret'));
  assert.throws(() => buildProductLookupRequest({ identifier: fixture.item_id }), /server-side/);
  assert.throws(() => buildProductLookupRequest({ apiKey: 'x', identifier: fixture.item_id, forceRefresh: true }), /requires a retailer/);

  const received = await lookupProduct({
    apiKey: 'unit-test-secret',
    identifier: fixture.item_id,
    fetchImpl: async () => ({ ok: true, status: 200, headers: { get: () => null }, json: async () => fixture })
  });
  assert.equal(received.item_id, fixture.item_id);

  await assert.rejects(() => lookupProduct({
    apiKey: 'bad',
    identifier: fixture.item_id,
    fetchImpl: async () => ({ ok: false, status: 403, headers: { get: () => null }, json: async () => ({ error: 'revoked', code: 'forbidden' }) })
  }), error => error instanceof RetailerApiError && error.status === 403 && error.code === 'forbidden');

  assert.equal(freshnessState('2026-09-02T18:00:00Z', { asOf: '2026-09-02T19:00:00Z' }).ok, true);
  assert.equal(freshnessState('2026-08-20T18:00:00Z', { asOf: '2026-09-02T19:00:00Z' }).reason, 'stale-observation');

  const normalized = normalizeRetailerApiProduct(fixture, { retrievedAt: '2026-09-02T19:00:00Z' });
  assert.equal(normalized.observations.length, 2, 'top-level Walmart duplicate must collapse while Home Depot remains distinct');
  assert.deepEqual(normalized.observations.map(o => o.retailer).sort(), ['homedepot', 'walmart']);
  assert(normalized.observations.every(o => o.channel === 'online'));
  assert(normalized.observations.every(o => !o.storeId && !o.zip));
  assert(normalized.observations.every(o => o.source.provider === 'retailerapi'));
  assert(normalized.observations.every(o => o.source.retentionPolicy === 'unknown'));
  assert(normalized.observations.every(o => o.source.redistributionAllowed === false));
  assert(normalized.rejected.some(row => row.reason === 'provider-status-stale'));
  assert(normalized.rejected.some(row => row.reason === 'provider-status-indexing'));

  const duplicate = normalized.observations[0];
  assert.equal(dedupeRetailerApiObservations([duplicate, duplicate]).length, 1);

  const ingestion = prepareRetailerApiIngestion(fixture, { retrievedAt: '2026-09-02T19:00:00Z' });
  assert.equal(ingestion.validationState, 'shadow');
  assert.equal(ingestion.alertsEnabled, false, 'RetailerAPI alerts remain disabled pending live validation');
  assert.equal(ingestion.rawAudit.sha256.length, 64);
  assert.equal(ingestion.rawAudit.tokensConsumed, 3);
  assert.equal(ingestion.rawAudit.redistributionAllowed, false);
  assert(!JSON.stringify(ingestion).includes('unit-test-secret'));

  console.log('retailerapi tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
