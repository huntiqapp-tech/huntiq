'use strict';
const assert=require('assert');
const fs=require('fs');
const {classifyOpportunityData,resolveCustomerDataState,partitionCustomerOpportunities}=require('../lib/pwa-data-state');
const asOf='2026-09-03T02:00:00.000Z';

// classifyOpportunityData is the pure freshness classifier and stays authority-blind
// (lib/customer-live-payload.js depends on this for internal freshness labeling).
const demo=classifyOpportunityData({dataOrigin:'demo',observedAt:asOf},{asOf});
assert.equal(demo.kind,'demo');assert.equal(demo.customerVisible,true);assert.equal(demo.alertEligible,false);
const live=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z'},{asOf});
assert.equal(live.kind,'live');assert.equal(live.customerVisible,true);assert.equal(live.alertEligible,true);
const cached=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-02T18:00:00.000Z'},{asOf});
assert.equal(cached.kind,'cached');assert.equal(cached.alertEligible,false);
const delayed=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-08-30T18:00:00.000Z'},{asOf});
assert.equal(delayed.kind,'delayed');assert.equal(delayed.alertEligible,false);
const future=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T03:00:00.000Z'},{asOf});
assert.equal(future.kind,'delayed');assert.equal(future.reason,'future-observation');assert.equal(future.alertEligible,false);
const shadow=classifyOpportunityData({dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf},{asOf});
assert.equal(shadow.kind,'validation');assert.equal(shadow.customerVisible,false);assert.equal(shadow.alertEligible,false);

// resolveCustomerDataState is the authority-aware customer-facing gate built on top of
// classifyOpportunityData. A live opportunity with a complete evidenceAuthority envelope
// stays visible/eligible; demo is exempt; shadow stays hidden regardless of authority.
const authority={historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};
const liveAuthorized=resolveCustomerDataState({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(liveAuthorized.kind,'live');assert.equal(liveAuthorized.customerVisible,true);assert.equal(liveAuthorized.alertEligible,true);
const liveMissingAuthority=resolveCustomerDataState({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z'},{asOf});
assert.equal(liveMissingAuthority.customerVisible,false,'a live opportunity with no evidenceAuthority envelope must fail closed, not fail open');
assert.equal(liveMissingAuthority.alertEligible,false);
const demoResolved=resolveCustomerDataState({dataOrigin:'demo',observedAt:asOf},{asOf});
assert.equal(demoResolved.customerVisible,true,'demo data is exempt from the authority gate');

const groups=partitionCustomerOpportunities([
  {id:'demo',dataOrigin:'demo',observedAt:asOf},
  {id:'live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z',evidenceAuthority:authority},
  {id:'live-no-authority',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-03T01:00:00.000Z'},
  {id:'shadow',dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf}
],{asOf});
assert.deepEqual(groups.demo.map(x=>x.id),['demo']);
assert.deepEqual(groups.live.map(x=>x.id),['live']);
assert.deepEqual(groups.hidden.map(x=>x.id).sort(),['live-no-authority','shadow']);

const appSource=fs.readFileSync(require.resolve('../app.js'),'utf8');
assert(appSource.includes("d.observedAt||d.timestamp||new Date().toISOString()"),'customer feed must preserve provider observation time for freshness classification');
assert(appSource.includes("Array.isArray(d.priceHistory)?d.priceHistory:[]"),'live rows without history must render safely');
assert(appSource.includes("d.dataOrigin==='demo'?'Demo sold':'Verified sold'"),'resale evidence labels must distinguish demo and live rows');
assert(appSource.includes('HuntIQDataState.resolveCustomerDataState(d).customerVisible'),'the rendered deal list must be gated through the authority-aware resolveCustomerDataState, not the freshness-only classifyOpportunityData');
console.log('pwa data-state tests passed');
