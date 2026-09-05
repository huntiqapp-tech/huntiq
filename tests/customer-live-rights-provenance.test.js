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
const assessment = { observation, historyObservations, completedSales, historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:90}, resaleConfidence:90, economics:{expectedProfit:50,roi:125,downsideProfit:30,downsideRoi:75}, opportunity:{evidence:{alertEligible:true}} };
const batch = a => ({provider:'retailerapi',validationState:'validated',assessments:[a]});

const valid = buildCustomerLivePayload(batch(assessment), validation, {asOf,enableAlerts:true});
assert.equal(valid.opportunities.length,1);
assert.equal(valid.opportunities[0].customerAlertEligible,true,'explicit rights and retention provenance may reach customer alerts when all other evidence is ready');

const missingRights = buildCustomerLivePayload(batch({...assessment,observation:{...observation,source:{...source,rightsClass:null}}}), validation, {asOf,enableAlerts:true});
assert.equal(missingRights.opportunities.length,0,'missing rights class must reject the live opportunity');
assert.equal(missingRights.alertsEnabled,false);
assert.match(missingRights.rejected[0].reason,/rights class required/);

const missingRetention = buildCustomerLivePayload(batch({...assessment,observation:{...observation,source:{...source,retentionPolicy:null}}}), validation, {asOf,enableAlerts:true});
assert.equal(missingRetention.opportunities.length,0,'missing retention policy must reject the live opportunity');
assert.equal(missingRetention.alertsEnabled,false);
assert.match(missingRetention.rejected[0].reason,/retention policy required/);

console.log('customer live rights provenance tests passed');
