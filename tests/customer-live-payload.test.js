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
const historyObservations = [
  { price: 49.99, observedAt: '2026-08-13T05:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true },
  { price: 47.99, observedAt: '2026-08-20T05:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true },
  { price: 45.99, observedAt: '2026-08-27T05:00:00.000Z', channel: 'online', source: { provider: 'retailerapi' }, verified: true }
];
const batch = {
  provider: 'retailerapi',
  validationState: 'validated',
  assessments: [{
    observation,
    priceHistory: [49.99, 47.99, 45.99],
    historyObservations,
    completedSales: [
      { status: 'sold', price: 89, soldAt: '2026-09-02T05:00:00.000Z' },
      { status: 'completed', price: 91, soldAt: '2026-09-01T05:00:00.000Z' },
      { status: 'fulfilled', price: 87, soldAt: '2026-08-31T05:00:00.000Z' }
    ],
    historyEvidence: { historyPromoted: true, promotedCount: 3, anomalyConfidence: 82 },
    resaleConfidence: 78,
    economics: { expectedProfit: 31, roi: 77, downsideProfit: 18, downsideRoi: 45 },
    opportunity: { evidence: { alertEligible: true } }
  }]
};

assert.throws(() => buildCustomerLivePayload({ ...batch, validationState: 'shadow' }, validation, { asOf }), /validated provider batch/);
assert.throws(() => buildCustomerLivePayload(batch, { ...validation, manualSourceCheckPassed: false }, { asOf }), /manual source validation/);
assert.throws(() => buildCustomerLivePayload({ ...batch, provider: 'unknown-provider' }, validation, { asOf }), /supported provider batch/);

const safe = buildCustomerLivePayload(batch, validation, { asOf });
assert.equal(safe.opportunities.length, 1);
assert.equal(safe.provider, 'retailerapi');
assert.equal(safe.opportunities[0].dataState, 'live');
assert.equal(safe.opportunities[0].channel, 'online');
assert.deepEqual(safe.opportunities[0].priceHistory, [49.99, 47.99, 45.99]);
assert.equal(safe.opportunities[0].priceHistoryObservations.length, 3);
assert.equal(safe.opportunities[0].priceHistoryObservations[0].observedAt, '2026-08-13T05:00:00.000Z');
assert.equal(safe.opportunities[0].completedSales.length, 3);
assert.equal(safe.opportunities[0].comps.soldCount, 3);
assert.equal(safe.opportunities[0].liveReadiness.historyDisposition, 'validated-history');
assert.equal(safe.opportunities[0].customerAlertEligible, false, 'alerts remain off by default after validation');
assert.equal(safe.alertsEnabled, false);
assert(!JSON.stringify(safe).toLowerCase().includes('authorization'));

const enabled = buildCustomerLivePayload(batch, validation, { asOf, enableAlerts: true });
assert.equal(enabled.opportunities[0].customerAlertEligible, true);
assert.equal(enabled.alertsEnabled, true);

const timestampLess = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...batch.assessments[0], historyObservations: undefined }]
}, validation, { asOf, enableAlerts: true });
assert.equal(timestampLess.opportunities[0].priceHistory.length, 0, 'numeric live history without timestamps must not enter the customer anomaly timeline');
assert.equal(timestampLess.opportunities[0].priceHistoryObservations.length, 0);
assert.equal(timestampLess.opportunities[0].liveReadiness.historyDisposition, 'shadow-quarantine');
assert.equal(timestampLess.opportunities[0].customerAlertEligible, false);
assert.equal(timestampLess.alertsEnabled, false);

const contaminatedHistory = buildCustomerLivePayload({
  ...batch,
  assessments: [{
    ...batch.assessments[0],
    historyObservations: [
      historyObservations[0],
      { ...historyObservations[1], channel: 'store' },
      { ...historyObservations[2], observedAt: observation.observedAt }
    ],
    historyEvidence: { historyPromoted: true, promotedCount: 99, anomalyConfidence: 82 }
  }]
}, validation, { asOf, enableAlerts: true });
assert.equal(contaminatedHistory.opportunities[0].priceHistoryObservations.length, 1, 'channel-mismatched and non-historical rows must be excluded');
assert.equal(contaminatedHistory.opportunities[0].liveReadiness.historyEvidence.promotedCount, 1, 'claimed promoted history cannot exceed accepted timestamped rows');
assert.equal(contaminatedHistory.opportunities[0].customerAlertEligible, false, 'thin accepted history must remain fail-closed');

const quarantined = buildCustomerLivePayload({
  ...batch,
  assessments: [{ ...batch.assessments[0], historyEvidence: { historyPromoted: false, promotedCount: 0 } }]
}, validation, { asOf, enableAlerts: true });
assert.equal(quarantined.opportunities.length, 1, 'rights-cleared live evidence may remain visible while validation is incomplete');
assert.equal(quarantined.opportunities[0].liveReadiness.historyDisposition, 'shadow-quarantine');
assert.equal(quarantined.opportunities[0].customerAlertEligible, false);
assert.equal(quarantined.alertsEnabled, false);

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

const brightDataObservation = {
  ...observation,
  retailer: 'home-depot',
  productId: 'hd-1001',
  storeId: '4121',
  zip: '18360',
  source: {
    ...observation.source,
    provider: 'bright-data',
    providerRecordId: 'snapshot-row-22',
    rightsClass: 'licensed-customer-display',
    retentionPolicy: 'contract-defined',
    redistributionAllowed: true
  }
};
const brightDataHistory = historyObservations.map((row, index) => ({
  ...row,
  retailer: 'home-depot',
  storeId: '4121',
  channel: 'online',
  source: { provider: 'bright-data' },
  price: [59.99, 54.99, 49.99][index]
}));
const brightData = buildCustomerLivePayload({
  provider: 'brightdata',
  validationState: 'validated',
  assessments: [{
    ...batch.assessments[0],
    observation: brightDataObservation,
    historyObservations: brightDataHistory
  }]
}, validation, { asOf, enableAlerts: true });
assert.equal(brightData.provider, 'bright-data');
assert.equal(brightData.opportunities.length, 1);
assert.equal(brightData.opportunities[0].source.provider, 'bright-data');
assert(brightData.opportunities[0].id.startsWith('bright-data-'));
assert.equal(brightData.opportunities[0].storeId, '4121');
assert.equal(brightData.opportunities[0].zip, '18360');
assert.equal(brightData.opportunities[0].priceHistoryObservations.length, 3);
assert.equal(brightData.opportunities[0].customerAlertEligible, true);

const provenanceMismatch = buildCustomerLivePayload({
  provider: 'bright-data',
  validationState: 'validated',
  assessments: [{ ...batch.assessments[0], observation }]
}, validation, { asOf });
assert.equal(provenanceMismatch.opportunities.length, 0);
assert.equal(provenanceMismatch.rejected.length, 1);
assert.match(provenanceMismatch.rejected[0].reason, /provider provenance mismatch/);

console.log('customer live-payload tests passed');
