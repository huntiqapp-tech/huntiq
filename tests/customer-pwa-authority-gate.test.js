'use strict';
const assert=require('assert');
const {customerAuthorityDisposition,classifyOpportunityData,resolveCustomerDataState,partitionCustomerOpportunities}=require('../lib/pwa-data-state');
const asOf='2026-09-05T11:00:00.000Z';
const complete={historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};
const incomplete={...complete,marketComparisonAuthoritative:false,profitRoiAuthoritative:false,notificationAuthoritative:false};
const authorized={id:'authorized',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',evidenceAuthority:complete};
const withheld={id:'withheld',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',referencePrice:999,customerProfit:500,customerRoi:400,comps:{d30:899,d60:875,d90:849},evidenceAuthority:incomplete};
const missingAuthority={id:'missing',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',referencePrice:999,customerProfit:500,customerRoi:400};

// customerAuthorityDisposition() is the low-level envelope reader: it only reports
// what's in evidenceAuthority, it does not decide visibility.
assert.deepEqual(customerAuthorityDisposition(authorized),{present:true,complete:true,missing:[]});
const withheldAuthority=customerAuthorityDisposition(withheld);
assert.equal(withheldAuthority.complete,false);
assert(withheldAuthority.missing.includes('marketComparisonAuthoritative'));
assert(withheldAuthority.missing.includes('profitRoiAuthoritative'));
assert.deepEqual(customerAuthorityDisposition(missingAuthority),{present:false,complete:null,missing:[]});

// classifyOpportunityData() stays a pure freshness classifier and is NOT authority-aware
// -- this is intentional (lib/customer-live-payload.js relies on this for internal
// freshness labeling before evidence authority has even been computed). A live item
// with no evidenceAuthority at all is still reported as freshness-live here.
const freshnessOnly=classifyOpportunityData(missingAuthority,{asOf});
assert.equal(freshnessOnly.kind,'live');
assert.equal(freshnessOnly.customerVisible,true,'classifyOpportunityData alone must never be treated as the customer-visibility decision');

// resolveCustomerDataState() is the actual customer-facing gate and must fail closed.
const authorizedState=resolveCustomerDataState(authorized,{asOf});
assert.equal(authorizedState.kind,'live');
assert.equal(authorizedState.customerVisible,true);
assert.equal(authorizedState.alertEligible,true);

const withheldState=resolveCustomerDataState(withheld,{asOf});
assert.equal(withheldState.kind,'validation');
assert.equal(withheldState.customerVisible,false);
assert.equal(withheldState.alertEligible,false);
assert(withheldState.reason.startsWith('customer-authority-incomplete:'));

// REGRESSION: an opportunity with a MISSING evidenceAuthority envelope must fail closed
// exactly like an incomplete one -- it must NOT become customer-visible or alert-eligible.
// This is the bug PR #119 shipped (a "legacy compatibility" bypass that let opportunities
// with no authority envelope through as fully live/alert-eligible).
const missingState=resolveCustomerDataState(missingAuthority,{asOf});
assert.equal(missingState.customerVisible,false,'missing evidenceAuthority must not be customer-visible');
assert.equal(missingState.alertEligible,false,'missing evidenceAuthority must not be alert-eligible');
assert.equal(missingState.kind,'validation');
assert.equal(missingState.reason,'customer-authority-missing');

// Demo data is explicitly exempt from the authority gate -- it is synthetic and never
// carries a real evidenceAuthority envelope, and must keep working exactly as before.
const demo=resolveCustomerDataState({id:'demo',dataOrigin:'demo',observedAt:asOf},{asOf});
assert.equal(demo.kind,'demo');
assert.equal(demo.customerVisible,true);
assert.equal(demo.alertEligible,false);

// Cached/delayed non-demo opportunities missing authority must also fail closed, not
// just live ones -- the gate applies to every customer-visible freshness kind.
const cachedMissingAuthority={id:'cached-missing',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-04T20:00:00.000Z'};
const cachedMissingState=resolveCustomerDataState(cachedMissingAuthority,{asOf});
assert.equal(cachedMissingState.customerVisible,false,'cached opportunities missing authority must also fail closed');

// A freshness state that is already hidden for its own reasons (e.g. shadow validation)
// must stay hidden regardless of authority -- authority can only narrow visibility, never
// widen it.
const shadow=resolveCustomerDataState({id:'shadow',dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf,evidenceAuthority:complete},{asOf});
assert.equal(shadow.customerVisible,false);

const groups=partitionCustomerOpportunities([authorized,withheld,missingAuthority,{id:'demo',dataOrigin:'demo',observedAt:asOf}],{asOf});
assert.deepEqual(groups.live.map(x=>x.id),['authorized']);
assert.deepEqual(groups.demo.map(x=>x.id),['demo']);
assert.deepEqual(groups.hidden.map(x=>x.id).sort(),['missing','withheld']);
console.log('customer PWA authority gate tests passed');
