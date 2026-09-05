'use strict';
const assert = require('assert');
const { buildCustomerLivePayload } = require('../lib/customer-live-payload');

const asOf = '2026-09-05T06:30:00.000Z';
const validation = { authenticatedLookupPassed:true, manualSourceCheckPassed:true, customerDisplayAllowed:true, validatedAt:'2026-09-05T06:00:00.000Z' };
const source = { provider:'retailerapi', providerRecordId:'rights-row-1', providerStatus:'ok', retrievedAt:'2026-09-05T05:45:00.000Z', rightsClass:'licensed-customer-display', retentionPolicy:'contract-defined', redistributionAllowed:true };
const observation = { retailer:'target', productId:'rights-1', price:40, observedAt:'2026-09-05T05:30:00.000Z', channel:'online', source };
const historyObservations = [1,2,3].map((n,i)=>({ productId:'rights-1', price:80-i*5, observedAt:`2026-08-${10+n}T05:00:00.000Z`, channel:'online', source:{provider:'retailerapi'}, verified:true }));
const completedSales = [
  {productId:'rights-1',status:'sold',price:90,soldAt:'2026-09-04T04:00:00.000Z',verified:true},
  {productId:'rights-1',status:'sold',price:92,soldAt:'2026-09-03T04:00:00.000Z',verified:true},
  {productId:'rights-1',status:'sold',price:88,soldAt:'2026-09-02T04:00:00.000Z',verified:true}
];
const comps = { productId:'rights-1', d30:91, d60:89, d90:87, soldWindowDays:30, activeListingCount:5, currentAsks:[99,105], verified:true };
const assessment = { observation, historyObservations, completedSales, comps, referencePrice:80, historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:90}, resaleConfidence:90, economics:{expectedProfit:50,roi:125,downsideProfit:30,downsideRoi:75}, opportunity:{evidence:{alertEligible:true}} };
const batch = a => ({provider:'retailerapi',validationState:'validated',assessments:[a]});

const valid = buildCustomerLivePayload(batch(assessment), validation, {asOf,enableAlerts:true});
assert.equal(valid.opportunities.length,1);
assert.equal(valid.opportunities[0].customerAlertEligible,true,'explicit rights and retention provenance may reach customer alerts when all other evidence is ready');
assert.equal(valid.opportunities[0].referencePrice,80,'validated history may expose the anomaly reference price');
assert.equal(valid.opportunities[0].comps.authoritative,true,'three verified completed sales plus verified aggregate provenance may authorize aggregate resale comps');
assert.equal(valid.opportunities[0].comps.aggregateVerified,true);
assert.equal(valid.opportunities[0].comps.d30,91);

const unverifiedAggregate = buildCustomerLivePayload(batch({...assessment,comps:{...comps,verified:false,d30:499,d60:499,d90:499}}), validation, {asOf,enableAlerts:true});
assert.equal(unverifiedAggregate.opportunities[0].completedSales.length,3,'verified individual completed sales remain visible');
assert.equal(unverifiedAggregate.opportunities[0].comps.authoritative,false,'unverified aggregate comp provenance must not be customer-authoritative');
assert.equal(unverifiedAggregate.opportunities[0].comps.d30,null);
assert.equal(unverifiedAggregate.opportunities[0].liveReadiness.resaleReady,false,'unverified aggregate inputs must not preserve resale readiness');
assert.equal(unverifiedAggregate.opportunities[0].liveReadiness.conservativeProfit,0);
assert.equal(unverifiedAggregate.opportunities[0].liveReadiness.conservativeRoi,0);
assert.equal(unverifiedAggregate.opportunities[0].customerAlertEligible,false);

const shallowHistory = buildCustomerLivePayload(batch({...assessment,historyObservations:historyObservations.slice(0,2),historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:90}}), validation, {asOf,enableAlerts:true});
assert.equal(shallowHistory.opportunities[0].liveReadiness.historyReady,false);
assert.equal(shallowHistory.opportunities[0].referencePrice,null,'unready history must not expose a customer anomaly reference price');
assert.equal(shallowHistory.opportunities[0].liveReadiness.anomalyConfidence,0);
assert.equal(shallowHistory.opportunities[0].liveReadiness.conservativeProfit,0);
assert.equal(shallowHistory.opportunities[0].liveReadiness.conservativeRoi,0);
assert.equal(shallowHistory.opportunities[0].customerAlertEligible,false);

const shallowSales = buildCustomerLivePayload(batch({...assessment,completedSales:completedSales.slice(0,2)}), validation, {asOf,enableAlerts:true});
assert.equal(shallowSales.opportunities[0].liveReadiness.resaleReady,false);
assert.equal(shallowSales.opportunities[0].comps.authoritative,false,'insufficient verified sold depth must not authorize aggregate resale comps');
assert.equal(shallowSales.opportunities[0].comps.d30,null);
assert.equal(shallowSales.opportunities[0].comps.d60,null);
assert.equal(shallowSales.opportunities[0].comps.d90,null);
assert.equal(shallowSales.opportunities[0].liveReadiness.conservativeProfit,0);
assert.equal(shallowSales.opportunities[0].liveReadiness.conservativeRoi,0);
assert.equal(shallowSales.opportunities[0].customerAlertEligible,false);

const missingRights = buildCustomerLivePayload(batch({...assessment,observation:{...observation,source:{...source,rightsClass:null}}}), validation, {asOf,enableAlerts:true});
assert.equal(missingRights.opportunities.length,0,'missing rights class must reject the live opportunity');
assert.equal(missingRights.alertsEnabled,false);
assert.match(missingRights.rejected[0].reason,/rights class required/);

const missingRetention = buildCustomerLivePayload(batch({...assessment,observation:{...observation,source:{...source,retentionPolicy:null}}}), validation, {asOf,enableAlerts:true});
assert.equal(missingRetention.opportunities.length,0,'missing retention policy must reject the live opportunity');
assert.equal(missingRetention.alertsEnabled,false);
assert.match(missingRetention.rejected[0].reason,/retention policy required/);

console.log('customer live rights provenance tests passed');
