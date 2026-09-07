'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');
const { classifyOpportunityData } = require('../lib/pwa-data-state');
const { evaluateAcquisition } = require('../lib/acquisition-cost');
const Ranking = require('../lib/opportunity-ranking');

const asOf = '2026-09-07T18:00:00.000Z';
const observation = {
  retailer: 'home-depot', productId: 'sku-127', storeId: '4121', zip: '18360', channel: 'store',
  title: 'Invariant integration fixture', price: 100, observedAt: '2026-09-07T17:00:00.000Z', availability: 'in stock',
  source: { provider: 'bright-data', providerRecordId: 'bd-127', providerStatus: 'ok', retrievedAt: '2026-09-07T17:01:00.000Z', rightsClass: 'licensed-customer-display', retentionPolicy: 'contract-defined', redistributionAllowed: true }
};
const validation = { authenticatedLookupPassed: true, manualSourceCheckPassed: true, customerDisplayAllowed: true, validatedAt: '2026-09-07T17:30:00.000Z' };
const history = [
  { retailer:'home-depot', productId:'sku-127', storeId:'4121', channel:'store', price:145, observedAt:'2026-08-24T17:00:00.000Z', source:{provider:'bright-data'}, verified:true },
  { retailer:'home-depot', productId:'sku-127', storeId:'9999', channel:'store', price:20, observedAt:'2026-08-28T17:00:00.000Z', source:{provider:'bright-data'}, verified:true },
  { retailer:'other-retailer', productId:'sku-127', storeId:'4121', channel:'store', price:5, observedAt:'2026-08-30T17:00:00.000Z', source:{provider:'bright-data'}, verified:true },
  { retailer:'home-depot', productId:'sku-127', storeId:'4121', channel:'online', price:1, observedAt:'2026-09-01T17:00:00.000Z', source:{provider:'bright-data'}, verified:true },
  { retailer:'home-depot', productId:'wrong-sku', storeId:'4121', channel:'store', price:2, observedAt:'2026-09-02T17:00:00.000Z', source:{provider:'bright-data'}, verified:true }
];
const sales = [
  { productId:'sku-127', status:'sold', price:95, soldAt:'2026-09-06T12:00:00.000Z', verified:true },
  { productId:'sku-127', status:'completed', price:100, soldAt:'2026-09-05T12:00:00.000Z', verified:true },
  { productId:'sku-127', status:'fulfilled', price:105, soldAt:'2026-09-04T12:00:00.000Z', verified:true },
  { productId:'sku-127', status:'active', price:999, soldAt:'2026-09-03T12:00:00.000Z', verified:true },
  { productId:'wrong-sku', status:'sold', price:799, soldAt:'2026-09-03T12:00:00.000Z', verified:true }
];
const assessment = {
  observation, historyObservations: history, completedSales: sales,
  historyEvidence: { historyPromoted: true, promotedCount: 5, anomalyConfidence: 80 },
  comps: { productId:'sku-127', verified:true, d30:100, d60:98, d90:96, soldWindowDays:90, activeListingCount:30, currentAsks:[999,899] },
  resaleConfidence: 85,
  economics: { expectedProfit: 35, roi: 35, downsideProfit: 15, downsideRoi: 15 },
  opportunity: { evidence: { alertEligible: true } }
};
const batch = { provider:'brightdata', validationState:'validated', assessments:[assessment] };

// Production customer release must fail closed before any row is exposed when batch authority is incomplete.
assert.throws(() => buildCustomerLivePayload({...batch, validationState:'shadow'}, validation, {asOf}), /validated provider batch/);
assert.throws(() => buildCustomerLivePayload(batch, {...validation, customerDisplayAllowed:false}, {asOf}), /customer display/);

// The real PWA caller filters every supplied customer opportunity through the production authority classifier.
const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
assert(appSource.includes("suppliedDeals].filter(d=>HuntIQDataState.classifyOpportunityData(d).customerVisible)"), 'PWA supplied live data must remain behind the production customer authority classifier');
const authorityBlocked = classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T17:00:00.000Z',customerProfit:999,customerRoi:999},{asOf});
assert.strictEqual(authorityBlocked.customerVisible, false, 'missing customer authority envelope must fail closed');
assert.strictEqual(authorityBlocked.alertEligible, false, 'unauthorized live data must never alert');

// The production live-payload builder must isolate history by retailer + product + store + channel.
const payload = buildCustomerLivePayload(batch, validation, {asOf, enableAlerts:true});
assert.strictEqual(payload.opportunities.length, 1);
const customer = payload.opportunities[0];
assert.deepStrictEqual(customer.priceHistory, [145], 'cross-store/channel/retailer/product observations must never contaminate price history');
assert.strictEqual(customer.priceHistoryObservations[0].storeId, '4121');
assert.strictEqual(customer.priceHistoryObservations[0].channel, 'store');

// Completed verified exact-product sales authorize resale aggregates; active asks stay separate and cannot set market value.
assert.deepStrictEqual(customer.completedSales.map(row=>row.price).sort((a,b)=>a-b), [95,100,105]);
assert.strictEqual(customer.comps.soldCount, 3);
assert.strictEqual(customer.comps.authoritative, true);
assert.strictEqual(customer.comps.d30, 100, 'verified completed-sale aggregate must remain the resale valuation input');
assert.deepStrictEqual(customer.comps.currentAsks, [999,899], 'active asks may be shown separately but must not replace sold valuation');

// Deferred rebates/rewards affect economic value separately; they do not rewrite raw shelf/checkout price history.
const deferred = evaluateAcquisition({price:100,taxRate:0,acquisition:{futureCredit:25,futureCreditType:'rebate-credit',realizationRate:1,daysToCredit:0,annualDiscountRate:0}});
assert.strictEqual(deferred.checkoutPrice, 100);
assert.strictEqual(deferred.cashOutlay, 100);
assert.strictEqual(deferred.expectedFutureCredit, 25);
assert.strictEqual(deferred.economicAcquisitionCost, 75);
assert.strictEqual(customer.price, 100, 'raw observed retailer price must stay independent of deferred promotion economics');
assert.deepStrictEqual(customer.priceHistory, [145]);

// Ranking consumes opportunity economics/evidence, never affiliate payout.
const baseRank = {profit:70,roi:55,confidence:88,anomaly:{dropPct:35},resale:{liquidityScore:82,estimatedDaysToSell:12},downsideEconomics:{roi:28},capitalEfficiency:{score:80},executionConfidence:{score:90},evidenceAgreement:{score:92},opportunityHalfLife:{evidenceStrengthRemainingPct:94}};
const affiliateInflated = {...baseRank, affiliateCommission:999999, affiliatePayout:999999, affiliateValue:999999};
assert.strictEqual(Ranking.bestOpportunityScore(affiliateInflated), Ranking.bestOpportunityScore(baseRank), 'affiliate economics must be neutral to HUNTIQ ranking');

console.log('autonomy production-invariant integration tests passed');
