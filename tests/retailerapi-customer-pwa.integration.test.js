'use strict';

const assert = require('assert');
const fixture = require('./fixtures/retailerapi-product.json');
const { lookupProduct, prepareRetailerApiIngestion } = require('../lib/retailerapi');
const { reviewProviderValidationRun, promoteValidatedObservation } = require('../lib/provider-validation-review');
const { buildCustomerAuthorizedLivePayload } = require('../lib/customer-live-authority');
const { classifyOpportunityData } = require('../lib/pwa-data-state');

(async () => {
  const retrievedAt = '2026-09-02T18:05:00.000Z';
  let observedRequest = null;
  const product = await lookupProduct({
    apiKey: 'x',
    identifier: fixture.item_id,
    fetchImpl: async (url, options) => {
      observedRequest = { url, options };
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => JSON.parse(JSON.stringify(fixture)) };
    }
  });
  assert.match(observedRequest.options.headers.Authorization, /^Bearer /, 'server integration must authenticate the provider lookup');

  const shadow = prepareRetailerApiIngestion(product, { retrievedAt, maxAgeHours: 48 });
  assert.equal(shadow.validationState, 'shadow');
  assert.equal(shadow.alertsEnabled, false);
  const walmart = shadow.observations.find(row => row.retailer === 'walmart');
  assert(walmart, 'real RetailerAPI normalization path must produce the Walmart observation');
  assert.equal(walmart.source.redistributionAllowed, false, 'raw provider data must start fail-closed');

  assert.throws(() => buildCustomerAuthorizedLivePayload(
    { ...shadow, assessments: [{ observation: walmart }] },
    { authenticatedLookupPassed: true, manualSourceCheckPassed: true, customerDisplayAllowed: true, validatedAt: '2026-09-02T18:10:00.000Z' },
    { asOf: '2026-09-02T18:15:00.000Z', enableAlerts: true }
  ), /validated provider batch required/, 'shadow provider data must never cross the customer boundary');

  const review = reviewProviderValidationRun({
    provider: 'retailerapi', retailer: 'walmart', providerStatus: 'ready', normalizedCount: shadow.observations.length, snapshotId: 'fixture-snapshot'
  }, {
    manualSourceCheckPassed: true,
    customerDisplayAllowed: true,
    retentionAllowed: true,
    redistributionAllowed: true,
    rightsClass: 'licensed-customer-display',
    retentionPolicy: 'contract-defined',
    checkedAt: '2026-09-02T18:10:00.000Z',
    providerObservation: walmart,
    sourceObservation: JSON.parse(JSON.stringify(walmart))
  });
  assert.equal(review.validationState, 'validated');
  assert.equal(review.customerDisplayAllowed, true);
  const promoted = promoteValidatedObservation(walmart, review);
  assert.equal(promoted.source.redistributionAllowed, true);

  const identity = { retailer: promoted.retailer, productId: promoted.productId, sku: promoted.sku, channel: promoted.channel, source: { provider: 'retailerapi' }, verified: true };
  const historyObservations = [
    { ...identity, price: 122, observedAt: '2026-08-10T18:00:00.000Z' },
    { ...identity, price: 118, observedAt: '2026-08-20T18:00:00.000Z' },
    { ...identity, price: 115, observedAt: '2026-08-30T18:00:00.000Z' },
    { ...identity, storeId: 'different-store', price: 20, observedAt: '2026-08-31T18:00:00.000Z' }
  ];
  const completedSales = [
    { productId: promoted.productId, status: 'sold', price: 151, soldAt: '2026-08-30T12:00:00.000Z', verified: true },
    { productId: promoted.productId, status: 'completed', price: 149, soldAt: '2026-08-29T12:00:00.000Z', verified: true },
    { productId: promoted.productId, status: 'fulfilled', price: 150, soldAt: '2026-08-28T12:00:00.000Z', verified: true },
    { productId: promoted.productId, status: 'active', price: 900, soldAt: '2026-08-27T12:00:00.000Z', verified: true },
    { productId: 'different-product', status: 'sold', price: 800, soldAt: '2026-08-26T12:00:00.000Z', verified: true }
  ];
  const assessment = {
    observation: promoted,
    historyObservations,
    completedSales,
    historyEvidence: { historyPromoted: true, promotedCount: 4, anomalyConfidence: 92 },
    resaleConfidence: 90,
    referencePrice: 118,
    comps: { productId: promoted.productId, verified: true, d30: 150, d60: 149, d90: 148, soldWindowDays: 90, activeListingCount: 2, currentAsks: [160, 165] },
    economics: { expectedProfit: 32, roi: 31, downsideProfit: 20, downsideRoi: 18 },
    opportunity: { evidence: { alertEligible: true } }
  };
  const validation = {
    authenticatedLookupPassed: true,
    manualSourceCheckPassed: true,
    customerDisplayAllowed: true,
    validatedAt: '2026-09-02T18:10:00.000Z'
  };
  const payload = buildCustomerAuthorizedLivePayload(
    { provider: 'retailerapi', validationState: 'validated', assessments: [assessment] },
    validation,
    { asOf: '2026-09-02T18:15:00.000Z', enableAlerts: true }
  );
  assert.equal(payload.rejected.length, 0);
  assert.equal(payload.opportunities.length, 1);
  const customer = payload.opportunities[0];
  assert.deepEqual(customer.priceHistory, [122, 118, 115], 'cross-location history must be removed before customer presentation');
  assert.equal(customer.completedSales.length, 3, 'only verified completed sales for the same product may reach customer presentation');
  assert(!customer.completedSales.some(row => row.price === 900 || row.price === 800), 'asking prices and mismatched sold comps must not become market evidence');
  assert.equal(customer.evidenceAuthority.historyAuthoritative, true);
  assert.equal(customer.evidenceAuthority.marketComparisonAuthoritative, true);
  assert.equal(customer.evidenceAuthority.profitRoiAuthoritative, true);
  assert.equal(customer.evidenceAuthority.notificationAuthoritative, true);
  assert.equal(customer.customerProfit, 20, 'customer profit must use conservative expected net economics');
  assert.equal(customer.customerRoi, 18, 'customer ROI must use conservative expected net economics');

  const pwaState = classifyOpportunityData(customer, { asOf: '2026-09-02T18:15:00.000Z' });
  assert.equal(pwaState.kind, 'live');
  assert.equal(pwaState.customerVisible, true);
  assert.equal(pwaState.alertEligible, true);
  assert(!JSON.stringify(payload).includes('Bearer x'), 'provider credentials must never cross the customer payload boundary');

  const incomplete = JSON.parse(JSON.stringify(customer));
  incomplete.evidenceAuthority.marketComparisonAuthoritative = false;
  const withheld = classifyOpportunityData(incomplete, { asOf: '2026-09-02T18:15:00.000Z' });
  assert.equal(withheld.customerVisible, false, 'PWA must fail closed when customer evidence authority becomes incomplete');

  console.log('RetailerAPI -> validation -> customer payload -> PWA integration tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
