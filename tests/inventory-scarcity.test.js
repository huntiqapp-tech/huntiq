const assert=require('assert');
const {assessInventoryScarcity}=require('../lib/inventory-scarcity');

const abundant=assessInventoryScarcity({inventory:{currentCount:18,previousCount:20,ageHours:1,sourceConfidence:90,readyForPickup:true},execution:{score:85}});
assert.equal(abundant.selloutRisk,'low');
assert.equal(abundant.alertPriority,'digest');
assert.equal(abundant.alertEligible,true);

const scarce=assessInventoryScarcity({inventory:{currentCount:2,previousCount:8,ageHours:1,sourceConfidence:90,readyForPickup:true},lifecycle:{retailerClearance:true,stage:'terminal-clearance'}});
assert(['high','critical'].includes(scarce.selloutRisk));
assert.equal(scarce.timing,'act-now');
assert.equal(scarce.alertPriority,'instant');
assert(scarce.waitRiskScore>=65);
assert(scarce.declinePct>=70);

const stale=assessInventoryScarcity({inventory:{currentCount:1,previousCount:5,ageHours:40,sourceConfidence:80,readyForPickup:false}});
assert(stale.score<scarce.score);
assert(stale.cautions.some(v=>v.includes('24 hours')));
assert.notEqual(stale.alertPriority,'instant');

const gone=assessInventoryScarcity({inventory:{currentCount:0,previousCount:3,ageHours:1,sourceConfidence:95,readyForPickup:false}});
assert.equal(gone.alertEligible,false);
assert.equal(gone.timing,'skip');
assert.equal(gone.alertPriority,'digest');
assert(gone.blockers.some(v=>v.includes('unavailable')));

console.log('inventory scarcity tests passed');
