'use strict';
// Integration coverage for the customer PWA authority gate: exercises the actual
// customer-facing surfaces (the PWA's rendered-deal filter in app.js, and the
// customer live-payload builder), not just the pwa-data-state.js helper in isolation.
const assert=require('assert');
const fs=require('fs');
const {resolveCustomerDataState}=require('../lib/pwa-data-state');
const {buildCustomerLivePayload}=require('../lib/customer-live-payload');
const {buildCustomerAuthorizedLivePayload,projectAuthorizedOpportunity}=require('../lib/customer-live-authority');

// --- 1. Prove app.js and lib/pwa-runtime.js actually call the fail-closed gate ---
// (not just that the gate function itself works standalone).
const appSource=fs.readFileSync(require.resolve('../app.js'),'utf8');
assert(appSource.includes('HuntIQDataState.resolveCustomerDataState(d).customerVisible'),'app.js must gate the customer deal list through resolveCustomerDataState, not the freshness-only classifyOpportunityData');
assert(!appSource.includes('HuntIQDataState.classifyOpportunityData(d).customerVisible'),'app.js must not use the authority-blind classifyOpportunityData for customer visibility');
const runtimeSource=fs.readFileSync(require.resolve('../lib/pwa-runtime.js'),'utf8');
assert(runtimeSource.includes('root.HuntIQDataState.resolveCustomerDataState(d'),'lib/pwa-runtime.js must re-classify each deal through resolveCustomerDataState so the PWA cannot re-promote withheld evidence client-side');

// --- 2. Replicate app.js's exact rendered-deal filter logic against realistic fixtures ---
// This is the same one-line filter shipped in app.js, run here directly so the test does
// not depend on a browser/DOM.
const demoDeal={id:'demo-1',dataOrigin:'demo',observedAt:'2026-09-05T10:00:00.000Z'};
const authorizedLiveDeal={id:'live-authorized',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',evidenceAuthority:{historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true}};
const unauthorizedLiveDeal={id:'live-missing-authority',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',referencePrice:250,customerProfit:120,customerRoi:90};
const asOf='2026-09-05T11:00:00.000Z';
const rendered=[demoDeal,authorizedLiveDeal,unauthorizedLiveDeal].filter(d=>resolveCustomerDataState(d,{asOf}).customerVisible);
assert.deepEqual(rendered.map(d=>d.id).sort(),['demo-1','live-authorized'],'a live deal with no evidence-authority envelope must never reach the rendered deal list, while demo and fully-authorized live deals must');

// --- 3. Prove the customer live-payload path (buildCustomerLivePayload) actually wires
// projectAuthorizedOpportunity/evidence-authority in, rather than leaving it dead code. ---
const observation={retailer:'walmart',productId:'integration-item-1',title:'Integration test product',price:39.99,observedAt:'2026-09-05T10:00:00.000Z',channel:'online',availability:'in stock',source:{provider:'retailerapi',providerRecordId:'integration-row-1',providerStatus:'ok',retrievedAt:'2026-09-05T10:00:30.000Z',rightsClass:'licensed-customer-display',retentionPolicy:'contract-defined',redistributionAllowed:true}};
const validation={authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,validatedAt:'2026-09-05T10:15:00.000Z'};
const fullHistory=[1,2,3].map((n,i)=>({productId:'integration-item-1',price:60-i,observedAt:`2026-08-${10+n}T10:00:00.000Z`,channel:'online',source:{provider:'retailerapi'},verified:true}));
const fullSales=[1,2,3].map((n,i)=>({productId:'integration-item-1',status:'sold',price:70+i,soldAt:`2026-09-0${4-i}T10:00:00.000Z`,verified:true}));
const strongComps={productId:'integration-item-1',d30:65,d60:63,d90:60,soldWindowDays:90,verified:true};
const strongAssessment={observation,historyObservations:fullHistory,completedSales:fullSales,comps:strongComps,historyEvidence:{historyPromoted:true,promotedCount:3,anomalyConfidence:88},resaleConfidence:82,economics:{expectedProfit:22,roi:55,downsideProfit:14,downsideRoi:35},opportunity:{evidence:{alertEligible:true}}};
const strongBatch={provider:'retailerapi',validationState:'validated',assessments:[strongAssessment]};
const strongPayload=buildCustomerLivePayload(strongBatch,validation,{asOf:'2026-09-05T10:20:00.000Z',enableAlerts:true});
assert.equal(strongPayload.opportunities.length,1);
const strongItem=strongPayload.opportunities[0];
assert(strongItem.evidenceAuthority,'buildCustomerLivePayload must attach evidenceAuthority to every opportunity it returns');
assert.equal(strongItem.evidenceAuthority.historyAuthoritative,true);
assert.equal(strongItem.evidenceAuthority.marketComparisonAuthoritative,true);
assert.equal(strongItem.customerAlertEligible,true,'fully authorized evidence should remain alert-eligible after projection');
// The resolved customer data-state for a fully authorized live opportunity produced by the
// real payload builder must be visible -- proves the two halves (payload authority
// projection + pwa-data-state gate) agree with each other end to end.
const strongResolved=resolveCustomerDataState(strongItem,{asOf:'2026-09-05T10:20:00.000Z'});
assert.equal(strongResolved.customerVisible,true);
assert.equal(strongResolved.alertEligible,true);

// Weak evidence (only one verified completed sale -- below the 3-sale minimum): the
// payload builder must itself withhold the redacted fields, AND resolveCustomerDataState
// must independently withhold the whole opportunity.
const weakAssessment={...strongAssessment,completedSales:[fullSales[0]]};
const weakBatch={provider:'retailerapi',validationState:'validated',assessments:[weakAssessment]};
const weakPayload=buildCustomerLivePayload(weakBatch,validation,{asOf:'2026-09-05T10:20:00.000Z',enableAlerts:true});
const weakItem=weakPayload.opportunities[0];
assert.equal(weakItem.evidenceAuthority.marketComparisonAuthoritative,false,'insufficient verified sales must not be market-comparison authoritative');
assert.equal(weakItem.comps.d30,null,'unauthorized market-comparison evidence must be redacted from comps');
assert.equal(weakItem.customerAlertEligible,false,'insufficient evidence must not be alert-eligible');
const weakResolved=resolveCustomerDataState(weakItem,{asOf:'2026-09-05T10:20:00.000Z'});
assert.equal(weakResolved.customerVisible,false,'an opportunity the payload builder could not fully authorize must be withheld by the customer-facing gate');

// --- 4. Prove buildCustomerAuthorizedLivePayload / projectAuthorizedOpportunity are no
// longer dead code: buildCustomerAuthorizedLivePayload must produce the same
// authority-projected result as buildCustomerLivePayload (it delegates to it), and
// projectAuthorizedOpportunity must be reachable and produce a consistent projection when
// called directly with the authority buildCustomerLivePayload already computed. ---
const authorizedPayload=buildCustomerAuthorizedLivePayload(strongBatch,validation,{asOf:'2026-09-05T10:20:00.000Z',enableAlerts:true});
assert.deepEqual(authorizedPayload,strongPayload,'buildCustomerAuthorizedLivePayload must delegate to (and therefore actually use) the now-authority-aware buildCustomerLivePayload');
const manualProjection=projectAuthorizedOpportunity({referencePrice:10,comps:{d30:20,authoritative:true},liveReadiness:{conservativeProfit:5,conservativeRoi:10,alertEligible:true},customerAlertEligible:true},{anomalyAuthoritative:false,marketComparisonAuthoritative:true,profitRoiAuthoritative:false,notificationAuthoritative:false});
assert.equal(manualProjection.referencePrice,null,'projectAuthorizedOpportunity must remain independently callable and must still redact unauthorized fields');

console.log('customer PWA authority integration tests passed');
