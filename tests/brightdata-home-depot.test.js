const assert = require('assert');
const {
  HOME_DEPOT_DATASET_ID,
  planHomeDepotTrigger,
  buildHomeDepotTriggerRequest,
  buildSnapshotRequest,
  normalizeHomeDepotRecords,
  triggerHomeDepotSnapshot,
  getSnapshotProgress,
  downloadSnapshotRecords,
  collectHomeDepotShadowSnapshot,
  safeRequestLog,
  extractPrice
} = require('../lib/brightdata-home-depot');
const { locationKey } = require('../lib/live-ingestion');

const products = [
  { url: 'https://www.homedepot.com/p/example-one/100000001', zip: '18360' },
  { url: 'https://www.homedepot.com/p/example-two/100000002', zip: '18064' }
];

const plan = planHomeDepotTrigger({ products, monthToDateRecords: 4999 });
assert.equal(plan.inputs.length, 1, 'monthly free-tier guard should cap the trigger before spend');
assert.equal(plan.usage.allowedRecords, 1);
assert.equal(plan.blocked, true);

const request = buildHomeDepotTriggerRequest({ apiToken: 'test-secret', products });
assert.equal(request.request.method, 'POST');
assert.ok(request.request.url.includes(HOME_DEPOT_DATASET_ID));
assert.ok(request.request.headers.Authorization.includes('test-secret'));
assert.equal(JSON.parse(request.request.body)[0].zipcode, '18360');

const progressRequest = buildSnapshotRequest({ apiToken: 'test-secret', snapshotId: 's_test123', kind: 'progress' });
assert.ok(progressRequest.url.endsWith('/progress/s_test123'));
const downloadRequest = buildSnapshotRequest({ apiToken: 'test-secret', snapshotId: 's_test123', kind: 'download' });
assert.ok(downloadRequest.url.includes('/snapshot/s_test123?format=json'));
assert.throws(() => buildSnapshotRequest({ apiToken: 'test-secret', snapshotId: '../bad' }), /snapshot ID/);

const logged = safeRequestLog(request.request);
assert.equal(logged.headers.Authorization, '[REDACTED]');
assert.equal(logged.bodyCount, 2);
assert.ok(!JSON.stringify(logged).includes('test-secret'));

assert.throws(() => planHomeDepotTrigger({ products: [{ url: 'https://example.com/product', zip: '18360' }] }), /Home Depot URL/);
assert.throws(() => planHomeDepotTrigger({ products: [{ url: products[0].url, zip: '1836' }] }), /ZIP/);
assert.throws(() => buildHomeDepotTriggerRequest({ products }), /server-side/);

assert.equal(extractPrice({ price: '$49.03' }), 49.03);
assert.equal(extractPrice({ sale_price: '1,299.99' }), 1299.99);

const records = [
  { product_id: '319386960', sku: '1007172275', model_number: '22716800934', price: '$49.03', timestamp: '2026-08-31T15:00:00Z', url: products[0].url, zipcode: '18360', availability: 'In Stock' },
  { product_id: '319386960', sku: '1007172275', model_number: '22716800934', current_price: 79, timestamp: '2026-08-31T15:05:00Z', url: products[0].url, zipcode: '18064', availability: 'In Stock' }
];
const normalized = normalizeHomeDepotRecords(records);
assert.equal(normalized[0].retailer, 'home depot');
assert.equal(normalized[0].source.provider, 'bright-data');
assert.equal(normalized[0].source.datasetId, HOME_DEPOT_DATASET_ID);
assert.equal(normalized[0].source.rightsClass, 'internal-only');
assert.notEqual(locationKey(normalized[0]), locationKey(normalized[1]), 'different ZIP prices must remain isolated');

(async () => {
  let captured;
  const triggered = await triggerHomeDepotSnapshot({
    apiToken: 'test-secret',
    products: [products[0]],
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return { ok: true, status: 200, json: async () => ({ snapshot_id: 's_test123' }) };
    }
  });
  assert.equal(captured.options.redirect, 'error');
  assert.equal(triggered.snapshotId, 's_test123');
  assert.equal(triggered.validationState, 'shadow-pending');
  assert.equal(triggered.alertsEnabled, false);
  assert.ok(!JSON.stringify(triggered).includes('test-secret'));

  await assert.rejects(() => triggerHomeDepotSnapshot({
    apiToken: 'test-secret',
    products: [products[0]],
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({}) })
  }), /malformed trigger response/);

  const progress = await getSnapshotProgress({
    apiToken: 'test-secret', snapshotId: 's_test123',
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ snapshot_id: 's_test123', dataset_id: HOME_DEPOT_DATASET_ID, status: 'ready' }) })
  });
  assert.equal(progress.ready, true);

  const downloaded = await downloadSnapshotRecords({
    apiToken: 'test-secret', snapshotId: 's_test123',
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => records })
  });
  assert.equal(downloaded.length, 2);

  let call = 0;
  const lifecycle = await collectHomeDepotShadowSnapshot({
    apiToken: 'test-secret', products: [products[0]], observedAt: '2026-09-04T06:00:00Z',
    fetchImpl: async (url) => {
      call += 1;
      if (call === 1) return { ok: true, status: 200, json: async () => ({ snapshot_id: 's_lifecycle123' }) };
      if (url.includes('/progress/')) return { ok: true, status: 200, json: async () => ({ snapshot_id: 's_lifecycle123', dataset_id: HOME_DEPOT_DATASET_ID, status: call === 2 ? 'running' : 'ready' }) };
      return { ok: true, status: 200, json: async () => ([records[0]]) };
    }
  });
  assert.equal(lifecycle.ready, true);
  assert.equal(lifecycle.validationState, 'shadow-review-required');
  assert.equal(lifecycle.observationCount, 1);
  assert.equal(lifecycle.alertsEnabled, false);
  assert.equal(lifecycle.redistributable, false);
  assert.equal(lifecycle.historyPromotionAllowed, false);
  assert.equal(lifecycle.manualSourceCheckRequired, true);

  console.log('brightdata-home-depot tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
