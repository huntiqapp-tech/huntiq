'use strict';
const assert = require('assert');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');

const asOf = '2026-09-03T06:00:00.000Z';
const observation = { retailer:'walmart', productId:'item-123', title:'Test product', price:39.99, observedAt:'2026-09-03T05:00:00.000Z', channel:'online', availability:'in stock', source:{ provider:'retailerapi', providerRecordId:'provider-123', providerStatus:'ok', retrievedAt:'2026-09-03T05:00:30.000Z', rightsClass:'licensed-customer-display', retentionPolicy:'contract-defined', redistributionAllowed:true } };
const validation = { authenticatedLookupPassed:true, manualSourceCheckPassed:true, customerDisplayAllowed:true, validatedAt:'2026-09-03T05:30:00.000Z' };
const historyObservations = [
 {productId:'item-123',price:49.99,observedAt:'2026-08-13T05:00:00.000Z',channel:'online',source:{provider:'retailerapi'},verified:true},
 {productId:'item-123',price:47.99,observedAt:'2026-08-20T05:00:00.000Z',channel:'online',source:{provider:'retailerapi'},verified:true},
 {productId:'item-123',price:45.99,observedAt:'2026-08-27T05:00:00.000Z',channel:'online',source:{provider:'retailerapi'},verified:true}
];
const completedSales = [
 {productId:'item-123',status:'sold',price:89,soldAt:'2026-09-02T05:00:00.000Z',verified:true},
 {productId:'item-123',status:'completed',price:91,soldAt:'2026-09-01T05:00:00.000Z',verified:true},
 {productId:'item-123',status:'fulfilled',price:87,soldAt:'2026-08-31T05:00:00.000Z',verified:true}
];
const comps = { productId:'item-123', d30:75, d60:73, d90:70, soldWindowDays:90, verified:true };
const assessment = { observation, historyObservations, completedSales, comps, historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:82}, resaleConfidence:78, economics:{expectedProfit:31,roi:77,downsideProfit:18,downsideRoi:45}, opportunity:{evidence:{alertEligible:true}} };
const batch = { provider:'retailerapi', validationState:'validated', assessments:[assessment] };

assert.throws(()=>buildCustomerLivePayload({...batch,validationState:'shadow'},validation,{asOf}),/validated provider batch/);
assert.throws(()=>buildCustomerLivePayload(batch,{...validation,manualSourceCheckPassed:false},{asOf}),/manual source validation/);
assert.throws(()=>buildCustomerLivePayload({...batch,provider:'unknown-provider'},validation,{asOf}),/supported provider batch/);

const safe=buildCustomerLivePayload(batch,validation,{asOf});
assert.equal(safe.opportunities.length,1);
assert.deepEqual(safe.opportunities[0].priceHistory,[49.99,47.99,45.99]);
assert.equal(safe.opportunities[0].completedSales.length,3);
assert(safe.opportunities[0].completedSales.every(row=>row.verified===true));
assert.equal(safe.opportunities[0].comps.soldCount,3);
assert.equal(safe.opportunities[0].customerAlertEligible,false);

const enabled=buildCustomerLivePayload(batch,validation,{asOf,enableAlerts:true});
assert.equal(enabled.opportunities[0].customerAlertEligible,true);
assert.equal(enabled.opportunities[0].evidenceAuthority.notificationAuthoritative,true,'fully authorized evidence must be notification-authoritative');
assert.equal(enabled.alertsEnabled,true);

const contaminatedHistory=buildCustomerLivePayload({...batch,assessments:[{...assessment,historyObservations:[historyObservations[0],{...historyObservations[1],channel:'store'},{...historyObservations[2],observedAt:observation.observedAt}],historyEvidence:{historyPromoted:true,promotedCount:99,anomalyConfidence:82}}]},validation,{asOf,enableAlerts:true});
assert.equal(contaminatedHistory.opportunities[0].priceHistoryObservations.length,1);
assert.equal(contaminatedHistory.opportunities[0].liveReadiness.historyReady,false);
assert.equal(contaminatedHistory.opportunities[0].liveReadiness.anomalyConfidence,0);
assert.equal(contaminatedHistory.opportunities[0].customerAlertEligible,false);

const resaleContaminated=buildCustomerLivePayload({...batch,assessments:[{...assessment,completedSales:[completedSales[0],{...completedSales[1],productId:'different-item',price:499},{...completedSales[2],productId:null,price:599}],comps:{productId:'different-item',d30:550,currentAsks:[600]}}]},validation,{asOf,enableAlerts:true});
assert.equal(resaleContaminated.opportunities[0].completedSales.length,1);
assert.equal(resaleContaminated.opportunities[0].comps.soldCount,1);
assert.equal(resaleContaminated.opportunities[0].comps.d30,null);
assert.equal(resaleContaminated.opportunities[0].liveReadiness.resaleReady,false);
assert.equal(resaleContaminated.opportunities[0].liveReadiness.conservativeProfit,0);
assert.equal(resaleContaminated.opportunities[0].liveReadiness.conservativeRoi,0);
assert.equal(resaleContaminated.opportunities[0].customerAlertEligible,false);

const futureSales=buildCustomerLivePayload({...batch,assessments:[{...assessment,completedSales:[completedSales[0],{...completedSales[1],soldAt:'2026-09-03T05:30:00.000Z'},{...completedSales[2],soldAt:'2026-09-04T05:00:00.000Z'}]}]},validation,{asOf,enableAlerts:true});
assert.equal(futureSales.opportunities[0].completedSales.length,1);
assert.equal(futureSales.opportunities[0].liveReadiness.resaleReady,false);
assert.equal(futureSales.opportunities[0].customerAlertEligible,false);

const mixed=buildCustomerLivePayload({...batch,assessments:[assessment,{observation:{...observation,productId:'blocked',source:{...observation.source,redistributionAllowed:false}},opportunity:{}},{observation:{...observation,productId:'secret',authorization:'must-not-pass'},opportunity:{}}]},validation,{asOf});
assert.equal(mixed.opportunities.length,1);
assert.equal(mixed.rejected.length,2);
assert(mixed.rejected.some(row=>/not authorized/.test(row.reason)));
assert(mixed.rejected.some(row=>/secret-bearing/.test(row.reason)));
assert(!JSON.stringify(mixed).includes('must-not-pass'));

const cached=buildCustomerLivePayload({...batch,assessments:[{...assessment,observation:{...observation,observedAt:'2026-09-02T22:00:00.000Z'}}]},validation,{asOf,enableAlerts:true});
assert.equal(cached.opportunities[0].dataState,'cached');
assert.equal(cached.opportunities[0].customerAlertEligible,false);

const bdObs={...observation,retailer:'home-depot',productId:'hd-1001',storeId:'4121',zip:'18360',source:{...observation.source,provider:'bright-data',providerRecordId:'snapshot-row-22'}};
const bdHistory=historyObservations.map(row=>({...row,productId:'hd-1001',retailer:'home-depot',storeId:'4121',source:{provider:'bright-data'}}));
const bdSales=completedSales.map(row=>({...row,productId:'hd-1001'}));
const bdComps={...comps,productId:'hd-1001'};
const brightData=buildCustomerLivePayload({provider:'brightdata',validationState:'validated',assessments:[{...assessment,observation:bdObs,historyObservations:bdHistory,completedSales:bdSales,comps:bdComps}]},validation,{asOf,enableAlerts:true});
assert.equal(brightData.provider,'bright-data');
assert.equal(brightData.opportunities[0].completedSales.length,3);
assert.equal(brightData.opportunities[0].customerAlertEligible,true);

console.log('customer live-payload tests passed');
