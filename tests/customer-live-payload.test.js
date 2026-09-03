'use strict';
const assert = require('assert');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');

const asOf = '2026-09-03T06:00:00.000Z';
const observation = {
  retailer: 'walmart',
  productId: 'item-123',
  title: 'Test product',
  price: 39.99,
  observedAt: '2026-09-03T05:00:00.000Z',
  channel: 'online',
  availability: 'in stock',
  source: {
    provider: 'retailerapi',
    providerRecordId: 'provider-123',
    providerStatus: 'ok',
    retrievedAt: '2026-09-03T05:00:30.000Z',
    rightsClass: 'licensed-customer-display',
    retentionPolicy: 'contract-defined',
    redistributionAllowed: true
  }
};
const validation = {
  authenticatedLookupPassed: true,
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  validatedAt: '2026-09-03T05:30:00.000Z'
};
const batch = {
  provider: 'retailerapi',
  validationState: 'validated',
  assessments: [{ observation, opportunity: { evidence: { alertEligible: true } } }]
};

assert.throws(() => buildCustomerLivePayload({ ...batch, validationState: 'shadow' }, validation, { asOf }), /validated provider batch/);
assert.throws(() => buildCustomerLivePayload(batch, { ...validation, manualSourceCheckPassed: false }, { asOf }), /manual source validation/);

const safe = buildCustomerLivePayload(batch, validation, { asOf });
assert.equal(safe.opportunities.length, 1);
assert.equal(safe.opportunities[0].dataState, 'live');
assert.equal(safe.opportunities[0].channel, 'online');
assert.deepEqual(safe.opportunities[0].completedSales, []);
assert.equal(safe.opportunities[0].comps.soldCount, 0);
assert.equal(safe.opportunities[0].customerAlertEligible, false, 'alerts remain off by default after validation');
assert.equal(safe.alertsEnabled, false);
assert(!JSON.stringify(safe).toLowerCase().includes('authorization'));

const enabled = buildCustomerLivePayload(batch, validation, { asOf, enableAlerts: true });
assert.equal(enabled.opportunities[0].customerAlertEligible, true);
assert.equal(enabled.alertsEnabled, true);

const mixed = buildCustomerLivePayload({
  ...batch,
  assessments: [
    batch.assessments[0],
    { observation: { ...observation, productId: 'store-item', storeId: '102', channel: 'store' }, opportunity: {} },
    { observation: { ...observation, productId: 'blocked', source: { ...observation.source, redistributionAllowed: false } }, opportunity: {} },
    { observation: { ...observation, productId: 'secret', authorization: 'must-not-pass' }, opportunity: {} }
  ]
}, validation, { asOf });
assert.equal(mixed.opportunities.length, 2);
assert.equal(mixed.opportunities[1].storeId, '102');
assert.equal(mixed.opportunities[1].channel, 'store');
assert.equal(mixed.rejected.length, 2);
assert(mixed.rejected.some(row => /not authorized/.test(row.reason)));
assert(mixed.rejected.some(row => /secret-bearing/.test(row.reason)));
assert(!JSON.stringify(mixed).includes('must-not-pass'));

const cached = buildCustomerLivePayload({
  ...batch,
  assessments: [{ observation: { ...observation, observedAt: '2026-09-02T22:00:00.000Z' }, opportunity: { evidence: { alertEligible: true } } }]
}, validation, { asOf, enableAlerts: true });
assert.equal(cached.opportunities[0].dataState, 'cached');
assert.equal(cached.opportunities[0].customerAlertEligible, false);

console.log('customer live-payload tests passed');
