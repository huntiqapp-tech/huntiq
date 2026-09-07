'use strict';

const assert = require('assert');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');
const { classifyOpportunityData } = require('../lib/pwa-data-state');
const Resale = require('../lib/resale-history');
const History = require('../lib/history-query');
const Acquisition = require('../lib/acquisition-cost');
const Ranking = require('../lib/opportunity-ranking');

const asOf = '2026-09-07T16:00:00.000Z';
const observation = {
  retailer: 'walmart',
  productId: 'item-127',
  title: 'Invariant integration fixture',
  price: 50,
  storeId: 'PA-18360',
  zip: '18360',
  channel: 'store',
  observedAt: '2026-09-07T15:00:00.000Z',
  source: {
    provider: 'retailerapi',
    providerRecordId: 'row-127',
    providerStatus: 'ok',
    retrievedAt: '2026-09-07T15:05:00.000Z',
    rightsClass: 'licensed-customer-display',
    retentionPolicy: 'contract-defined',
    redistributionAllowed: true
  }
};
const validation = {
  authenticatedLookupPassed: true,
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  validatedAt: '2026-09-07T15:15:00.000Z'
};
const sameIdentity = {
  retailer: 'walmart', productId: 'item-127', storeId: 'PA-18360', channel: 'store',
  source: { provider: 'retailerapi' }, verified: true
};
const historyObservations = [
  { ...sameIdentity, price: 88, observedAt: '2026-08-20T15:00:00.000Z' },
  { ...sameIdentity, price: 84, observedAt: '2026-08-28T15:00:00.000Z' },
  { ...sameIdentity, price: 80, observedAt: '2026-09-04T15:00:00.000Z' },
  { ...sameIdentity, storeId: 'PA-OTHER', price: 10, observedAt: '2026-09-05T15:00:00.000Z' },
  { ...sameIdentity, channel: 'online', price: 12, observedAt: '2026-09-06T15:00:00.000Z' }
];
const completedSales = [
  { productId: 'item-127', status: 'sold', price: 101, soldAt: '2026-09-06T12:00:00.000Z', verified: true },
  { productId: 'item-127', status: 'completed', price: 99, soldAt: '2026-09-05T12:00:00.000Z', verified: true },
  { productId: 'item-127', status: 'fulfilled', price: 100, soldAt: '2026-09-04T12:00:00.000Z', verified: true },
  { productId: 'item-127', status: 'active', price: 999, soldAt: '2026-09-03T12:00:00.000Z', verified: true },
  { productId: 'different-item', status: 'sold', price: 777, soldAt: '2026-09-02T12:00:00.000Z', verified: true }
];
const assessment = {
  observation,
  historyObservations,
  completedSales,
  historyEvidence: { historyPromoted: true, promotedCount: 5, anomalyConfidence: 90 },
  resaleConfidence: 90,
  economics: { expectedProfit: 35, roi: 60, downsideProfit: 20, downsideRoi: 30 },
  opportunity: { evidence: { alertEligible: true } }
};

// The actual customer live-payload boundary must strip cross-store/channel history,
// ignore asking/listing rows and mismatched products, and expose no unauthorized fields.
const payload = buildCustomerLivePayload(
  { provider: 'retailerapi', validationState: 'validated', assessments: [assessment] },
  validation,
  { asOf, enableAlerts: true }
);
assert.equal(payload.opportunities.length, 1);
const live = payload.opportunities[0];
assert.deepEqual(live.priceHistory, [88, 84, 80], 'customer history must remain retailer/product/store/channel specific');
assert.equal(live.completedSales.length, 3, 'only verified completed sales for the same product may cross the customer boundary');
assert(live.completedSales.every(row => ['sold', 'completed', 'fulfilled'].includes(row.status)));
assert(!JSON.stringify(payload).includes('999'), 'active asking-price evidence must not contaminate the customer sold-comp payload');
assert(!JSON.stringify(payload).includes('777'), 'different-product sold evidence must not contaminate customer comps');

const secretPayload = buildCustomerLivePayload(
  { provider: 'retailerapi', validationState: 'validated', assessments: [{ ...assessment, authorization: 'never-expose-this' }] },
  validation,
  { asOf }
);
assert.equal(secretPayload.opportunities.length, 0, 'secret-bearing assessments must fail closed');
assert.equal(secretPayload.rejected.length, 1);
assert(!JSON.stringify(secretPayload).includes('never-expose-this'), 'secret material must never enter the browser payload');

// Customer presentation authority is independently fail-closed even when a row otherwise looks live/validated.
const missingAuthority = classifyOpportunityData({
  id: 'missing-authority', dataOrigin: 'live', validationState: 'validated', observedAt: observation.observedAt,
  referencePrice: 100, customerProfit: 50, customerRoi: 100
}, { asOf });
assert.equal(missingAuthority.customerVisible, false);
assert.equal(missingAuthority.alertEligible, false);
assert.equal(missingAuthority.reason, 'customer-authority-missing');

// Market value must be derived from completed-sale evidence, never active asking prices.
const resale = Resale.buildResaleHistory([
  { status: 'sold', price: 101, soldAt: '2026-09-06T12:00:00.000Z' },
  { status: 'completed', price: 99, soldAt: '2026-09-05T12:00:00.000Z' },
  { status: 'fulfilled', price: 100, soldAt: '2026-09-04T12:00:00.000Z' },
  { status: 'active', price: 999, soldAt: '2026-09-03T12:00:00.000Z' },
  { status: 'listed', price: 899, soldAt: '2026-09-02T12:00:00.000Z' }
], { asOf });
assert.equal(resale.completedSaleOnly, true);
assert.equal(resale.comparableCount, 3);
assert.equal(resale.marketValue, 100);
assert.match(resale.marketValueBasis, /verified-sold/);

// Price-history identity must not blend another store or channel into the baseline evidence.
const identityRows = History.windowObservations(historyObservations, {
  retailer: 'walmart', sku: 'item-127', storeId: 'PA-18360', channel: 'store'
}, { now: Date.parse(asOf), days: 30 });
assert.equal(identityRows.length, 3);
assert(identityRows.every(row => row.storeId === 'PA-18360' && row.channel === 'store'));

// Future credits/rebates may improve economic value, but never pretend checkout cash was lower.
const rebate = Acquisition.evaluateAcquisition({
  price: 100,
  taxRate: 0.06,
  acquisition: { futureCredit: 20, futureCreditType: 'rebate-credit', realizationRate: 1, daysToCredit: 0, annualDiscountRate: 0 }
});
assert.equal(rebate.checkoutPrice, 100);
assert.equal(rebate.cashOutlay, 106);
assert.equal(rebate.expectedFutureCredit, 20);
assert.equal(rebate.economicAcquisitionCost, 86);

// Affiliate economics are monetization metadata only and must not affect customer ranking.
const baseOpportunity = {
  id: 'base', profit: 70, roi: 55, confidence: 88, anomaly: { dropPct: 35 },
  resale: { liquidityScore: 82, estimatedDaysToSell: 12 }, downsideEconomics: { roi: 28 },
  capitalEfficiency: { score: 80 }, executionConfidence: { score: 90 }, evidenceAgreement: { score: 92 },
  opportunityHalfLife: { evidenceStrengthRemainingPct: 94 }
};
const affiliateInflated = { ...baseOpportunity, id: 'affiliate', affiliateCommission: 99999, affiliatePayout: 99999 };
assert.equal(Ranking.bestOpportunityScore(affiliateInflated), Ranking.bestOpportunityScore(baseOpportunity));

console.log('autonomy product invariant integration tests passed');
