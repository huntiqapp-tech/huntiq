'use strict';
const assert=require('assert');
const {assessExecutionConfidence,confirmationEvidence,availabilityScore}=require('../lib/execution-confidence');
const asOf='2026-09-03T12:00:00Z';
const repeated=[
 {price:50,observedAt:'2026-09-03T03:00:00Z'},
 {price:50.25,observedAt:'2026-09-03T07:00:00Z'},
 {price:49.99,observedAt:'2026-09-03T11:30:00Z'}
];
const evidence=confirmationEvidence(repeated,50,asOf);assert.equal(evidence.count,3);assert(evidence.distinctHours>=8);assert.equal(availabilityScore('In Stock'),100);assert.equal(availabilityScore('Out of Stock'),0);
const strong=assessExecutionConfidence({price:50,observations:repeated,asOf,availability:'In Stock',anomaly:{dropPct:60,confidence:88},baseProfit:70,conservativeRoi:35,dataOrigin:'live'});
assert(strong.score>=75);assert.equal(strong.alertEligible,true);assert(strong.expectedProfit>55);assert(strong.expectedRoi>100);assert.equal(strong.blockers.length,0);
const single=assessExecutionConfidence({price:50,observations:[{price:50,observedAt:'2026-09-03T11:30:00Z'}],asOf,availability:'In Stock',anomaly:{dropPct:75,confidence:92},baseProfit:100,conservativeRoi:50,dataOrigin:'live'});
assert(single.blockers.includes('extreme anomaly lacks repeat confirmation'));assert.equal(single.alertEligible,false);assert(single.expectedProfit<100);
const unavailable=assessExecutionConfidence({price:40,observations:repeated.map(x=>({...x,price:40})),asOf,availability:'Out of Stock',anomaly:{dropPct:55,confidence:90},baseProfit:80,conservativeRoi:30,dataOrigin:'live'});
assert(unavailable.blockers.includes('retailer availability is unavailable'));assert.equal(unavailable.alertEligible,false);
const demo=assessExecutionConfidence({price:10,observations:[{price:10,observedAt:'2026-09-03T08:00:00Z'},{price:10,observedAt:'2026-09-03T11:00:00Z'}],asOf,availability:'available',anomaly:{dropPct:90,confidence:99},baseProfit:200,conservativeRoi:100,dataOrigin:'demo'});
assert(demo.blockers.includes('demonstration data'));assert.equal(demo.alertEligible,false);
console.log('execution-confidence tests passed');