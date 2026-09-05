'use strict';
const assert=require('assert');
const {summarizeCustomerEvidenceAuthority}=require('../lib/customer-evidence-authority');

const ready={releaseReady:true,historyReady:true,resaleReady:true,economicsReady:true,anomalyConfidence:88,conservativeProfit:42,conservativeRoi:71,alertEligible:true,blockers:[]};
const history=[1,2,3].map(n=>({verified:true,price:70+n}));
const sales=[1,2,3].map(n=>({verified:true,price:90+n,status:'sold'}));
const strong=summarizeCustomerEvidenceAuthority({readiness:ready,priceHistoryObservations:history,completedSales:sales,comps:{authoritative:true},referencePrice:79,dataState:'live',alertsEnabled:true});
assert.equal(strong.historyAuthoritative,true);
assert.equal(strong.anomalyAuthoritative,true);
assert.equal(strong.marketComparisonAuthoritative,true);
assert.equal(strong.profitRoiAuthoritative,true);
assert.equal(strong.notificationAuthoritative,true);
assert.equal(strong.blockers.length,0);

const thinHistory=summarizeCustomerEvidenceAuthority({readiness:{...ready,historyReady:false,anomalyConfidence:0,alertEligible:false,blockers:['validated-price-history-insufficient']},priceHistoryObservations:history.slice(0,2),completedSales:sales,comps:{authoritative:true},referencePrice:null,dataState:'live',alertsEnabled:true});
assert.equal(thinHistory.historyVerifiedCount,2);
assert.equal(thinHistory.historyAuthoritative,false);
assert.equal(thinHistory.anomalyAuthoritative,false);
assert.equal(thinHistory.profitRoiAuthoritative,false);
assert.equal(thinHistory.notificationAuthoritative,false);
assert(thinHistory.blockers.includes('customer-history-authority-missing'));
assert(thinHistory.blockers.includes('customer-profit-roi-authority-missing'));

const unverifiedAggregate=summarizeCustomerEvidenceAuthority({readiness:{...ready,resaleReady:false,alertEligible:false,blockers:['resale-evidence-insufficient']},priceHistoryObservations:history,completedSales:sales,comps:{authoritative:false},referencePrice:79,dataState:'live',alertsEnabled:true});
assert.equal(unverifiedAggregate.anomalyAuthoritative,true,'valid history can remain authoritative independently');
assert.equal(unverifiedAggregate.marketComparisonAuthoritative,false);
assert.equal(unverifiedAggregate.profitRoiAuthoritative,false);
assert.equal(unverifiedAggregate.notificationAuthoritative,false);
assert(unverifiedAggregate.blockers.includes('customer-market-comparison-authority-missing'));

const cached=summarizeCustomerEvidenceAuthority({readiness:ready,priceHistoryObservations:history,completedSales:sales,comps:{authoritative:true},referencePrice:79,dataState:'cached',alertsEnabled:true});
assert.equal(cached.profitRoiAuthoritative,true,'evidence authority can remain visible for cached diagnostics');
assert.equal(cached.notificationAuthoritative,false,'only live customer state may authorize notifications');
assert(cached.blockers.includes('customer-notification-authority-missing'));
console.log('customer live authority summary tests passed');
