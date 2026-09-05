'use strict';

const assert = require('assert');
const { buildCustomerLivePayload, assertValidationCoversObservation } = require('../lib/customer-live-payload');

const asOf = '2026-09-05T03:00:00.000Z';
const observation = {
  retailer: 'staples',
  productId: 'staples-100',
  price: 49.99,
  observedAt: '2026-09-05T02:00:00.000Z',
  channel: 'online',
  source: {
    provider: 'retailerapi',
    providerRecordId: 'staples-row-100',
    providerStatus: 'ok',
    retrievedAt: '2026-09-05T02:00:30.000Z',
    rightsClass: 'licensed-customer-display',
    retentionPolicy: 'contract-defined',
    redistributionAllowed: true
  }
};
const validation = {
  authenticatedLookupPassed: true,
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  validatedAt: '2026-09-05T02:30:00.000Z'
};
const historyObservations = [
  { productId: 'staples-100', price: 79.99, observedAt: '2026-08-15T02:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true },
  { productId: 'staples-100', price: 74.99, observedAt: '2026-08-22T02:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true },
  { productId: 'staples-100', price: 69.99, observedAt: '2026-08-29T02:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true }
];
const completedSales = [
  { productId: 'staples-100', status: 'sold', price: 99, soldAt: '2026-09-04T02:00:00.000Z' },
  { productId: 'staples-100', status: 'completed', price: 95, soldAt: '2026-09-03T02:00:00.000Z' },
  { productId: 'staples-100', status: 'fulfilled', price: 97, soldAt: '2026-09-02T02:00:00.000Z' }
];
const assessment = {
  observation,
  historyObservations,
  completedSales,
  historyEvidence: { historyPromoted: true, promotedCount: 3, anomalyConfidence: 80 },
  resaleConfidence: 80,
  economics: { expectedProfit: 30, roi: 60, downsideProfit: 18, downsideRoi: 36 },
  opportunity: { evidence: { alertEligible: true } }
};
const batch = { provider: 'retailerapi', validationState: 'validated', assessments: [assessment] };

const valid = buildCustomerLivePayload(batch, validation, { asOf, enableAlerts: true });
assert.equal(valid.opportunities.length, 1, 'properly ordered observation/retrieval/validation evidence should pass');
assert.equal(valid.rejected.length, 0);

assert.deepEqual(assertValidationCoversObservation(observation, validation, asOf), {
  observedAt: observation.observedAt,
  retrievedAt: observation.source.retrievedAt,
  validatedAt: validation.validatedAt,
  decisionAt: asOf
});

const staleValidation = buildCustomerLivePayload(batch, { ...validation, validatedAt: '2026-09-05T01:59:00.000Z' }, { asOf, enableAlerts: true });
assert.equal(staleValidation.opportunities.length, 0, 'older validation cannot authorize newer provider evidence');
assert.equal(staleValidation.rejected.length, 1);
assert.match(staleValidation.rejected[0].reason, /retrieved after validation|occurred after validation/);
assert.equal(staleValidation.alertsEnabled, false);

const postValidationRetrieval = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...assessment, observation: { ...observation, source: { ...observation.source, retrievedAt: '2026-09-05T02:45:00.000Z' } } }]
}, validation, { asOf, enableAlerts: true });
assert.equal(postValidationRetrieval.opportunities.length, 0, 'evidence retrieved after validation must be revalidated');
assert.match(postValidationRetrieval.rejected[0].reason, /retrieved after validation/);
assert.equal(postValidationRetrieval.alertsEnabled, false);

const futureObservation = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...assessment, observation: { ...observation, observedAt: '2026-09-05T03:05:00.000Z', source: { ...observation.source, retrievedAt: '2026-09-05T03:05:30.000Z' } } }]
}, { ...validation, validatedAt: '2026-09-05T03:10:00.000Z' }, { asOf, enableAlerts: true });
assert.equal(futureObservation.opportunities.length, 0, 'future retail observations cannot enter a historical customer decision');
assert.match(futureObservation.rejected[0].reason, /after customer decision time/);
assert.equal(futureObservation.alertsEnabled, false);

const missingRetrieval = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...assessment, observation: { ...observation, source: { ...observation.source, retrievedAt: null } } }]
}, validation, { asOf, enableAlerts: true });
assert.equal(missingRetrieval.opportunities.length, 0, 'customer-live evidence requires source retrieval provenance');
assert.match(missingRetrieval.rejected[0].reason, /source retrieval timestamp required/);
assert.equal(missingRetrieval.alertsEnabled, false);

const impossibleRetrievalOrder = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...assessment, observation: { ...observation, source: { ...observation.source, retrievedAt: '2026-09-05T01:59:00.000Z' } } }]
}, validation, { asOf, enableAlerts: true });
assert.equal(impossibleRetrievalOrder.opportunities.length, 0, 'retrieval cannot predate the retail observation it claims to carry');
assert.match(impossibleRetrievalOrder.rejected[0].reason, /retrieval predates retail observation/);
assert.equal(impossibleRetrievalOrder.alertsEnabled, false);

console.log('customer live validation-time tests passed');
