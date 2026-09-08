'use strict';
const assert=require('assert');
const {classifyOpportunityData,partitionCustomerOpportunities}=require('../lib/pwa-data-state');
const {
  detectAppMode,readSuppliedFeed,coerceIncoming,selectVisibleOpportunities,
  resolveCustomerAppFeed,filterOpportunities,presentProvenance,filterHistoryObservations,
  authorizedCompsForEconomics,customerEconomicsAuthorized,suppressUnauthorizedAlert,
  independentCustomerVisibility,revalidateCustomerDataState
}=require('../lib/customer-app-boundary');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {list}=require('../lib/demo-opportunities');
const {feed}=require('../lib/customer-feed-fixture');

const asOf='2026-09-07T12:00:00.000Z';
const authority={historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};

const unlabeled=classifyOpportunityData({title:'Mystery'},{asOf});
assert.equal(unlabeled.customerVisible,false,'unlabeled supplied rows must fail closed');
assert.equal(unlabeled.reason,'unlabeled-origin');

const validationOnly=classifyOpportunityData({dataOrigin:'validation-only',title:'Nope'},{asOf});
assert.equal(validationOnly.customerVisible,false);

const live=classifyOpportunityData({dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',evidenceAuthority:authority},{asOf});
assert.equal(live.kind,'live');
assert.equal(live.customerVisible,true);

assert.equal(detectAppMode({search:'?huntiq-mode=fixture'}),'fixture');
assert.equal(detectAppMode({search:'?fixture=1'}),'default');
assert.equal(detectAppMode({search:'?huntiq-mode=1&fixture=1'}),'default');
assert.equal(detectAppMode({search:''},{}),'default');
assert.equal(detectAppMode({globalObject:{HUNTIQ_APP_MODE:'fixture'}}),'fixture');

const supplied=readSuppliedFeed({HUNTIQ_CUSTOMER_OPPORTUNITIES:[{id:'x',dataOrigin:'demo'}]});
assert.equal(supplied.present,true);
assert.equal(supplied.opportunities.length,1);

const envelope=readSuppliedFeed({HUNTIQ_CUSTOMER_FEED:{generatedAt:asOf,alertsEnabled:false,opportunities:[{id:'live-1',dataOrigin:'live'}]}});
assert.equal(envelope.present,true);
assert.equal(envelope.opportunities[0].id,'live-1');

const coerced=coerceIncoming({title:'raw'});
assert.equal(coerced.dataOrigin,'validation-only');
const falseDemo=coerceIncoming({title:'raw'},{fromDemoFallback:true});
assert.equal(falseDemo.dataOrigin,'validation-only','demo fallback cannot relabel arbitrary rows as demo');

const selected=selectVisibleOpportunities([
  {id:'demo',dataOrigin:'demo',retailer:'Home Depot',title:'Demo',zip:'18360',channel:'store'},
  {id:'shadow',dataOrigin:'shadow-live',validationState:'shadow',title:'Hidden Shadow SKU'},
  {id:'unauth',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',title:'Unauthorized Live TV'},
  {id:'live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',title:'Live Drill',retailer:'Home Depot',zip:'18360',storeId:'1836',channel:'store',evidenceAuthority:authority,customerAlertEligible:true,alert:{alert:true}}
],{asOf,alertsEnabled:false});
assert.deepEqual(selected.visible.map(x=>x.id),['demo','live']);
assert(selected.hidden.some(x=>x.id==='shadow'));
assert(selected.hidden.some(x=>x.id==='unauth'));
assert.equal(selected.visible.find(x=>x.id==='live').alert.alert,false,'feed-disabled alerts stay suppressed');
assert.match(selected.visible.find(x=>x.id==='live').provenance.locationLabel,/ZIP 18360/);
assert.match(selected.visible.find(x=>x.id==='live').provenance.freshnessLabel,/Observed/);

const alertState={kind:'live',alertEligible:true,reason:null};
const alertRow={
  alert:{alert:true},customerAlertEligible:true,liveReadiness:{alertEligible:true},
  evidenceAuthority:{...authority}
};
assert.equal(suppressUnauthorizedAlert(alertRow,alertState,true).alert,true);
assert.equal(suppressUnauthorizedAlert(alertRow,alertState,false).alert,false,'feed must independently authorize');
assert.equal(suppressUnauthorizedAlert({...alertRow,customerAlertEligible:false},alertState,true).alert,false,'row must independently authorize');
assert.equal(suppressUnauthorizedAlert({...alertRow,liveReadiness:{alertEligible:false}},alertState,true).alert,false,'decision floor must independently authorize');
assert.equal(suppressUnauthorizedAlert({...alertRow,evidenceAuthority:{...authority,notificationAuthoritative:false}},alertState,true).alert,false,'authority envelope must independently authorize');

const demoFeed=resolveCustomerAppFeed({demoOpportunities:list(),asOf,location:{search:''},globalObject:{}});
assert.equal(demoFeed.mode,'demo');
assert.equal(demoFeed.visible.length,4);
assert(demoFeed.visible.every(x=>x.dataState.kind==='demo'));

const fixture=resolveCustomerAppFeed({
  demoOpportunities:list(),
  fixtureFeed:feed(),
  location:{search:'?huntiq-mode=fixture'},
  globalObject:{HUNTIQ_APP_MODE:'fixture'}
});
assert.equal(fixture.mode,'fixture');
assert(fixture.visible.some(x=>x.title==='Fixture Live Drill'&&x.dataState.kind==='live'));
assert(fixture.visible.some(x=>x.title==='Fixture Cached Fan'&&x.dataState.kind==='cached'));
assert(fixture.visible.some(x=>x.title==='Fixture Delayed Light'&&x.dataState.kind==='delayed'));
assert(fixture.visible.some(x=>x.title==='Fixture Demo Saw'&&x.dataState.kind==='demo'));
assert(!fixture.visible.some(x=>/Hidden Shadow|Unauthorized Live/.test(x.title)));
assert.equal(fixture.visible.find(x=>x.title==='Fixture Demo Saw').alert.alert,false);
assert.equal(fixture.visible.find(x=>x.title==='Fixture Live Drill').alert.alert,false);

const livePayload=resolveCustomerAppFeed({
  demoOpportunities:list(),
  location:{search:''},
  asOf,
  globalObject:{HUNTIQ_CUSTOMER_FEED:{
    generatedAt:asOf,
    alertsEnabled:false,
    opportunities:[{id:'server-live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',title:'Server Live Saw',retailer:'Home Depot',zip:'18360',channel:'store',storeId:'1836',evidenceAuthority:authority}]
  }}
});
assert.equal(livePayload.mode,'customer');
assert.deepEqual(livePayload.visible.map(x=>x.id),['server-live']);
assert(!livePayload.visible.some(x=>x.dataOrigin==='demo'),'server feed must not mix demo fallback');

const filtered=filterOpportunities(fixture.visible,{filter:'live',query:'drill',watchIds:new Set()});
assert.equal(filtered.length,1);
assert.equal(filtered[0].title,'Fixture Live Drill');

const empty=filterOpportunities(fixture.visible,{filter:'watch',query:'',watchIds:new Set()});
assert.equal(empty.length,0);

const provenance=presentProvenance({retailer:'Home Depot',zip:'18360',storeId:'1836',channel:'store'},{kind:'live',label:'LIVE',ageHours:1});
assert.equal(provenance.retailer,'Home Depot');
assert.match(provenance.locationLabel,/Store 1836/);
assert.equal(presentProvenance({retailer:'Home Depot'},{kind:'demo',label:'DEMO DATA',ageHours:null}).freshnessLabel,'Demonstration catalog');

const partialAuthority=classifyOpportunityData({
  dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',
  evidenceAuthority:{historyAuthoritative:true}
},{asOf});
assert.equal(partialAuthority.customerVisible,false);
assert.match(partialAuthority.reason,/customer-authority-incomplete/);
assert.equal(independentCustomerVisibility({dataOrigin:'live',validationState:'validated',evidenceAuthority:{...authority,notificationAuthoritative:1}},{kind:'live',customerVisible:true}).allowed,false,'truthy authority values must not pass strict revalidation');
assert.equal(revalidateCustomerDataState({dataOrigin:'live',validationState:'unvalidated',observedAt:'2026-09-07T11:00:00.000Z',evidenceAuthority:authority},{asOf}).customerVisible,false,'boundary must independently reject unvalidated customer rows');

const scopedDeal={retailer:'Home Depot',productId:'sku-1',channel:'local',storeId:'1836'};
const scopedHistory=filterHistoryObservations(scopedDeal,[
  {...scopedDeal,price:100,observedAt:'2026-09-07T10:00:00.000Z',verified:true},
  {...scopedDeal,storeId:'9999',price:1,observedAt:'2026-09-07T10:00:00.000Z',verified:true},
  {...scopedDeal,channel:'online',storeId:null,price:2,observedAt:'2026-09-07T10:00:00.000Z',verified:true},
  {...scopedDeal,retailer:"Lowe's",price:3,observedAt:'2026-09-07T10:00:00.000Z',verified:true}
],{before:asOf});
assert.deepEqual(scopedHistory.map(row=>row.price),[100],'history must match retailer, product, channel, and location');

const asksOnly={
  dataOrigin:'live',
  evidenceAuthority:{marketComparisonAuthoritative:false,profitRoiAuthoritative:false},
  comps:{currentAsks:[999],activeListingCount:1,authoritative:false},
  completedSales:[]
};
assert.deepEqual(authorizedCompsForEconomics(asksOnly).currentAsks,[]);
assert.equal(customerEconomicsAuthorized(asksOnly),false);

const browserSandbox={globalThis:{},URLSearchParams};
browserSandbox.globalThis=browserSandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','lib','customer-app-boundary.js'),'utf8'),browserSandbox);
const missingClassifier=browserSandbox.HuntIQCustomerAppBoundary.selectVisibleOpportunities([
  {id:'must-hide',dataOrigin:'live',validationState:'validated'}
],{asOf});
assert.equal(missingClassifier.visible.length,0);
assert.equal(missingClassifier.hidden[0].dataState.reason,'classification-unavailable');

const buggyClassifierSandbox={globalThis:{},URLSearchParams};
buggyClassifierSandbox.globalThis=buggyClassifierSandbox;
buggyClassifierSandbox.HuntIQDataState={classifyOpportunityData:()=>({kind:'live',label:'LIVE',customerVisible:true,alertEligible:true,ageHours:1,reason:null})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','lib','customer-app-boundary.js'),'utf8'),buggyClassifierSandbox);
const independentlyWithheld=buggyClassifierSandbox.HuntIQCustomerAppBoundary.selectVisibleOpportunities([
  {id:'classifier-regression',dataOrigin:'live',validationState:'validated',evidenceAuthority:{historyAuthoritative:true}}
],{asOf,alertsEnabled:true});
assert.equal(independentlyWithheld.visible.length,0,'a fail-open classifier regression must not expose a customer row');
assert.match(independentlyWithheld.hidden[0].dataState.reason,/customer-authority-incomplete/);

const groups=partitionCustomerOpportunities(feed().opportunities,{asOf});
assert(groups.hidden.some(x=>x.id==='fix-shadow-hidden'));
assert(groups.hidden.some(x=>x.id==='fix-unauthorized'));

console.log('customer app-boundary tests passed');
