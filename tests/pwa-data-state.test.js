'use strict';
const assert=require('assert');
const fs=require('fs');
const {classifyOpportunityData,partitionCustomerOpportunities}=require('../lib/pwa-data-state');
const asOf='2026-09-03T02:00:00.000Z';
const authority={historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};
const demo=classifyOpportunityData({dataOrigin:'demo',observedAt:asOf},{asOf});
assert.equal(demo.kind,'demo');assert.equal(demo.customerVisible,true);assert.equal(demo.alertEligible,false);
const live=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(live.kind,'live');assert.equal(live.customerVisible,true);assert.equal(live.alertEligible,true);
const cached=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-02T18:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(cached.kind,'cached');assert.equal(cached.alertEligible,false);
const delayed=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-08-30T18:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(delayed.kind,'delayed');assert.equal(delayed.alertEligible,false);
const future=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T03:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(future.kind,'delayed');assert.equal(future.reason,'future-observation');assert.equal(future.alertEligible,false);
const missingAuthority=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z'},{asOf});
assert.equal(missingAuthority.kind,'validation');assert.equal(missingAuthority.customerVisible,false);assert.equal(missingAuthority.reason,'customer-authority-missing');
const shadow=classifyOpportunityData({dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf},{asOf});
assert.equal(shadow.kind,'validation');assert.equal(shadow.customerVisible,false);assert.equal(shadow.alertEligible,false);
const groups=partitionCustomerOpportunities([
  {id:'demo',dataOrigin:'demo',observedAt:asOf},
  {id:'live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z',evidenceAuthority:authority},
  {id:'missing-authority',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z'},
  {id:'shadow',dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf}
],{asOf});
assert.deepEqual(groups.demo.map(x=>x.id),['demo']);
assert.deepEqual(groups.live.map(x=>x.id),['live']);
assert.deepEqual(groups.hidden.map(x=>x.id),['missing-authority','shadow']);
const appSource=fs.readFileSync(require.resolve('../app.js'),'utf8');
assert(appSource.includes("d.observedAt||d.timestamp||new Date().toISOString()"),'customer feed must preserve provider observation time for freshness classification');
assert(appSource.includes("Array.isArray(d.priceHistory)?d.priceHistory:[]"),'live rows without history must render safely');
assert(appSource.includes("d.dataOrigin==='demo'?'Demo sold':'Verified sold'"),'resale evidence labels must distinguish demo and live rows');
console.log('pwa data-state tests passed');
