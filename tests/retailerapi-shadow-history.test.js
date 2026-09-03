'use strict';

const assert = require('assert');
const fixture = require('./fixtures/retailerapi-product.json');
const { prepareRetailerApiIngestion } = require('../lib/retailerapi');
const {
  assertShadowBatch,
  mergeShadowHistory,
  evaluateRetailerApiShadowBatch,
  shadowHistoryRows
} = require('../lib/retailerapi-shadow-history');

const batch = prepareRetailerApiIngestion(fixture, { retrievedAt: '2026-09-02T19:00:00Z' });
assert.equal(assertShadowBatch(batch), batch);
assert.throws(() => assertShadowBatch({ ...batch, alertsEnabled: true }), /hard-disable alerts/);
assert.throws(() => assertShadowBatch({ ...batch, validationState: 'validated' }), /shadow validation state/);

const walmart = batch.observations.find(o => o.retailer === 'walmart');
const oldHistory = [
  { ...walmart, price: 159.99, observedAt: '2026-08-25T18:00:00Z' },
  { ...walmart, price: 149.99, observedAt: '2026-08-27T18:00:00Z' },
  { ...walmart, price: 155.00, observedAt: '2026-08-29T18:00:00Z' },
  { ...walmart, price: 152.00, observedAt: '2026-08-31T18:00:00Z' }
];

const merged = mergeShadowHistory(batch, [...oldHistory, walmart]);
assert.equal(merged.filter(o => o.retailer === 'walmart').length, 5, 'duplicate shadow observation must not deepen price history');

const result = evaluateRetailerApiShadowBatch(batch, {
  existingObservations: oldHistory,
  referencePrices: { walmart: 159.99 },
  comps: {},
  economics: {}
});
assert.equal(result.validationState, 'shadow');
assert.equal(result.dataState, 'shadow-live');
assert.equal(result.alertsEnabled, false);
assert.equal(result.acceptedObservationCount, 2);
assert.equal(result.assessments.length, 2);
assert(result.assessments.every(a => a.opportunity), 'shadow observations should still run through anomaly/economics evaluation');
assert(result.assessments.every(a => a.notification.send === false));
assert(result.assessments.every(a => a.notification.reason === 'provider-shadow-validation'));
assert(result.assessments.every(a => a.notification.dataState === 'shadow-live'));

const rows = shadowHistoryRows(batch);
assert.equal(rows.length, 2);
assert(rows.every(row => row.validation_state === 'shadow'));
assert(rows.every(row => row.alert_eligible === false));
assert(rows.every(row => row.provider === 'retailerapi'));
assert(rows.every(row => row.retention_policy === 'unknown'));
assert(rows.every(row => row.redistribution_allowed === false));
assert(rows.every(row => row.location_key.includes('|online|online')), 'RetailerAPI observations must stay isolated from store/ZIP history');

console.log('retailerapi shadow history tests passed');
