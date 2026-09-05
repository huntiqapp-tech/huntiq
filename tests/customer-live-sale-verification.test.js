'use strict';
const assert=require('assert');
const {buildCustomerLivePayload}=require('../lib/customer-live-payload');

const asOf='2026-09-05T06:00:00.000Z';
const observation={retailer:'walmart',productId:'verify-sale-1',price:40,observedAt:'2026-09-05T05:00:00.000Z',channel:'online',source:{provider:'retailerapi',providerRecordId:'verify-sale-row',providerStatus:'ok',retrievedAt:'2026-09-05T05:00:20.000Z',rightsClass:'licensed-customer-display',retentionPolicy:'contract-defined',redistributionAllowed:true}};
const validation={authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,validatedAt:'2026-09-05T05:20:00.000Z'};
const historyObservations=[1,2,3].map((n,i)=>({productId:'verify-sale-1',price:80-i*5,observedAt:`2026-08-${10+n}T05:00:00.000Z`,channel:'online',source:{provider:'retailerapi'},verified:true}));
const sale=(price,day,verified)=>({productId:'verify-sale-1',status:'sold',price,soldAt:`2026-09-0${day}T04:00:00.000Z`,verified});
const base={observation,historyObservations,historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:90},resaleConfidence:90,economics:{expectedProfit:50,roi:125,downsideProfit:30,downsideRoi:75},opportunity:{evidence:{alertEligible:true}}};

const contaminated=buildCustomerLivePayload({provider:'retailerapi',validationState:'validated',assessments:[{...base,completedSales:[sale(90,4,true),sale(499,3,false),sale(599,2,undefined)]}]},validation,{asOf,enableAlerts:true});
const item=contaminated.opportunities[0];
assert.equal(item.completedSales.length,1,'only individually verified completed sales may reach customer resale evidence');
assert.equal(item.completedSales[0].price,90);
assert.equal(item.completedSales[0].verified,true);
assert.equal(item.comps.soldCount,1,'unverified sold rows cannot supply resale depth');
assert.equal(item.liveReadiness.resaleReady,false,'one verified sale is insufficient for decision-grade resale evidence');
assert.equal(item.liveReadiness.conservativeProfit,0,'unverified resale evidence cannot authorize customer profit');
assert.equal(item.liveReadiness.conservativeRoi,0,'unverified resale evidence cannot authorize customer ROI');
assert.equal(item.customerAlertEligible,false,'unverified sales cannot unlock alerts');
assert.equal(contaminated.alertsEnabled,false);

const verified=buildCustomerLivePayload({provider:'retailerapi',validationState:'validated',assessments:[{...base,completedSales:[sale(90,4,true),sale(92,3,true),sale(88,2,true)]}]},validation,{asOf,enableAlerts:true});
assert.equal(verified.opportunities[0].completedSales.length,3);
assert.equal(verified.opportunities[0].liveReadiness.resaleReady,true);
assert.equal(verified.opportunities[0].liveReadiness.conservativeProfit,30);
assert.equal(verified.opportunities[0].liveReadiness.conservativeRoi,75);
assert.equal(verified.opportunities[0].customerAlertEligible,true);
assert.equal(verified.alertsEnabled,true);
console.log('customer live sale verification tests passed');
