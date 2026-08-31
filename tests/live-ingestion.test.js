const assert = require('assert');
const { normalizeLiveObservation, locationKey, enforceUsageBudget, redactSecrets } = require('../lib/live-ingestion');

const base = { product_id: '1001', model_number: 'M18-TEST', price: '49.03', timestamp: '2026-08-31T14:00:00Z', availability: 'in stock', url: 'https://example.test/product/1001' };
const a = normalizeLiveObservation(base, { retailer: 'Home Depot', provider: 'bright-data', zip: '18360' });
const b = normalizeLiveObservation(base, { retailer: 'Home Depot', provider: 'bright-data', zip: '18064' });

assert.equal(a.price, 49.03);
assert.equal(a.source.rightsClass, 'internal-only');
assert.notEqual(locationKey(a), locationKey(b), 'ZIP-specific prices must never share a history key');

const budget = enforceUsageBudget({ requestedRecords: 800, monthToDateRecords: 4700, budget: { maxRecordsPerRun: 500, maxRecordsPerMonth: 5000 } });
assert.deepEqual(budget, { requestedRecords: 800, allowedRecords: 300, remainingMonthlyRecords: 300, blocked: true });

const redacted = redactSecrets({ Authorization: 'Bearer exposed', nested: { api_key: 'exposed', harmless: 'ok' } });
assert.equal(redacted.Authorization, '[REDACTED]');
assert.equal(redacted.nested.api_key, '[REDACTED]');
assert.equal(redacted.nested.harmless, 'ok');

assert.throws(() => normalizeLiveObservation({ price: 10 }, { retailer: 'Home Depot' }), /identity/);
assert.throws(() => normalizeLiveObservation({ product_id: 'x', price: 'nope' }, { retailer: 'Home Depot' }), /price/);

console.log('live-ingestion tests passed');
