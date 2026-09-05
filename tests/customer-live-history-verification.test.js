'use strict';
const assert = require('assert');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');

const asOf='2026-09-05T04:00:00.000Z';
const observation={retailer:'best-buy',productId:'bb-101',price:49.99,observedAt:'2026-09-05T03:00:00.000Z',channel:'online',source:{provider:'retailerapi',providerRecordId:'bb-row-101',providerStatus:'ok',retrievedAt:'2026-09-05T03:00:30.000Z',rightsClass:'licensed-customer-display',retentionPolicy:'contract-defined',redistributionAllowed:true}};
const validation={authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,validatedAt:'2026-09-05T03:30:00.000Z'};
const verified={productId:'bb-101',price:79.99,observedAt:'2026-08-15T03:00:00.000Z',channel:'online',source:{provider:'retailerapi'},verified:true};
const unverified=[
  {...verified,price:199.99,observedAt:'2026-08-20T03:00:00.000Z',verified:false},
  {...verified,price:249.99,observedAt:'2026-08-25T03:00:00.000Z',verified:undefined}
];
const completedSales=[
 {productId:'bb-101',status:'sold',price:99,soldAt:'2026-09-04T02:00:00.000Z',verified:true},
 {productId:'bb-101',status:'completed',price:95,soldAt:'2026-09-03T02:00:00.000Z',verified:true},
 {productId:'bb-101',status:'fulfilled',price:97,soldAt:'2026-09-02T02:00:00.000Z',verified:true}
];
const batch={provider:'retailerapi',validationState:'validated',assessments:[{observation,historyObservations:[verified,...unverified],completedSales,historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:95},resaleConfidence:90,economics:{expectedProfit:40,roi:80,downsideProfit:25,downsideRoi:50},opportunity:{evidence:{alertEligible:true}}}]};
const result=buildCustomerLivePayload(batch,validation,{asOf,enableAlerts:true});
assert.equal(result.opportunities.length,1);
const item=result.opportunities[0];
assert.deepEqual(item.priceHistory,[79.99],'only individually verified historical observations may reach the customer timeline');
assert.equal(item.priceHistoryObservations.length,1);
assert.equal(item.priceHistoryObservations[0].verified,true);
assert.equal(item.liveReadiness.historyReady,false,'unverified rows cannot supply the minimum history depth');
assert.equal(item.liveReadiness.anomalyConfidence,0,'unverified prices cannot authorize customer anomaly confidence');
assert.equal(item.liveReadiness.conservativeProfit,0,'failed history readiness must remove customer profit authority');
assert.equal(item.liveReadiness.conservativeRoi,0,'failed history readiness must remove customer ROI authority');
assert.equal(item.customerAlertEligible,false,'unverified history cannot unlock alerts');
assert.equal(result.alertsEnabled,false);
console.log('customer live history verification tests passed');
