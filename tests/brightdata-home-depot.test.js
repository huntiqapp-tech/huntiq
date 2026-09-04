const assert = require('assert');
const {
  HOME_DEPOT_DATASET_ID,
  planHomeDepotTrigger,
  buildHomeDepotTriggerRequest,
  normalizeHomeDepotRecords,
  triggerHomeDepotSnapshot,
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
      return { ok: true, status: 200, json: async () => ({ snapshot_id: 'snapshot-test-123' }) };
    }
  });
  assert.equal(captured.options.redirect, 'error');
  assert.equal(triggered.snapshotId, 'snapshot-test-123');
  assert.equal(triggered.validationState, 'shadow-pending');
  assert.equal(triggered.alertsEnabled, false);
  assert.ok(!JSON.stringify(triggered).includes('test-secret'));

  await assert.rejects(() => triggerHomeDepotSnapshot({
    apiToken: 'test-secret',
    products: [products[0]],
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({}) })
  }), /malformed trigger response/);

  console.log('brightdata-home-depot tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
