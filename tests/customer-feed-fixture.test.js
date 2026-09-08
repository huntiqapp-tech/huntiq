'use strict';
const assert=require('assert');
const {feed,asOf}=require('../lib/customer-feed-fixture');
const {resolveCustomerAppFeed}=require('../lib/customer-app-boundary');

const payload=feed();
assert.equal(payload.dataState,'fixture');
assert.equal(payload.alertsEnabled,false);
assert.equal(asOf,'2026-09-07T12:00:00.000Z');
assert(payload.opportunities.some(x=>x.dataOrigin==='live'));
assert(payload.opportunities.some(x=>x.dataOrigin==='demo'));
assert(payload.opportunities.some(x=>x.dataOrigin==='shadow-live'));
assert(!JSON.stringify(payload).includes('RETAILERAPI_KEY'));
assert(!JSON.stringify(payload).includes('BRIGHTDATA'));

const resolved=resolveCustomerAppFeed({
  fixtureFeed:payload,
  location:{search:'?huntiq-mode=fixture'},
  globalObject:{},
  demoOpportunities:[]
});
assert.equal(resolved.mode,'fixture');
assert.equal(resolved.asOf,asOf);
assert.equal(resolved.visible.length,4);
assert.equal(resolved.hidden.length,2);
console.log('customer feed-fixture tests passed');
