const assert = require('assert');
const { normalizeLiveObservation, locationKey, enforceUsageBudget, redactSecrets } = require('../lib/live-ingestion');

const base = { product_id: '1001', model_number: 'M18-TEST', price: '49.03', timestamp: '2026-08-31T14:00:00Z', availability: 'in stock', url: 'https://example.test/product/1001' };
const a = normalizeLiveObservation(base, { retailer: 'Home Depot', provider: 'bright-data', zip: '18360' });
const b = normalizeLiveObservation(base, { retailer: 'Home Depot', provider: 'bright-data', zip: '18064' });

assert.equal(a.price, 49.03);
assert.equal(a.source.rightsClass, 'internal-only');
assert.equal(a.zip, '18360');
assert.equal(a.zipcode, '18360');
assert.equal(a.inventory, a.quantity);
assert.equal(a.provider, 'bright-data');
assert.equal(typeof a.source, 'object');
assert.notEqual(locationKey(a), locationKey(b), 'ZIP-specific prices must never share a history key');

const budget = enforceUsageBudget({ requestedRecords: 800, monthToDateRecords: 4700, budget: { maxRecordsPerRun: 500, maxRecordsPerMonth: 5000 } });
assert.deepEqual(budget, { requestedRecords: 800, allowedRecords: 300, remainingMonthlyRecords: 300, blocked: true });

const redacted = redactSecrets({ Authorization: 'Bearer exposed', nested: { api_key: 'exposed', harmless: 'ok' } });
assert.equal(redacted.Authorization, '[REDACTED]');
assert.equal(redacted.nested.api_key, '[REDACTED]');
assert.equal(redacted.nested.harmless, 'ok');

assert.throws(() => normalizeLiveObservation({ price: 10 }, { retailer: 'Home Depot' }), /identity/);
assert.throws(() => normalizeLiveObservation({ product_id: 'x', price: 'nope' }, { retailer: 'Home Depot' }), /price/);

const { observationFingerprint, jobFingerprint, sanitizeIngestionError, INGESTION_AUTOMATION_BUDGET } = require('../lib/live-ingestion');
assert.equal(observationFingerprint(a), `${locationKey(a)}|49.03|in stock|${a.observedAt}`);
assert.equal(jobFingerprint({ provider: 'upcitemdb', upc: '012345678905' }), 'upcitemdb|012345678905|online|');
const zipJob = { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18360' };
const zipcodeJob = { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zipcode: '18360' };
const otherZipJob = { provider: 'brightdata', url: 'https://www.homedepot.com/p/example/100000001', zip: '18064' };
assert.equal(jobFingerprint(zipJob), jobFingerprint(zipcodeJob));
assert.equal(jobFingerprint(zipJob), jobFingerprint({ ...zipJob, zipcode: '18360' }));
assert.ok(jobFingerprint(zipJob).includes('zip:18360'));
assert.ok(jobFingerprint(zipcodeJob).includes('zip:18360'));
assert.notEqual(jobFingerprint(zipJob), jobFingerprint(otherZipJob));
assert.ok(jobFingerprint(otherZipJob).includes('zip:18064'));
assert.equal(INGESTION_AUTOMATION_BUDGET.maxRecordsPerRun, 25);
const sanitized = sanitizeIngestionError(new Error('Bearer leaked-token failed'), { knownSecrets: ['leaked-token'] });
assert.equal(sanitized.message.includes('leaked-token'), false);
assert.ok(sanitized.message.includes('[REDACTED]'));

console.log('live-ingestion tests passed');
