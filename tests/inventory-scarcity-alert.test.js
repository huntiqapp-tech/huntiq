const assert=require('assert');
const {applyInventoryScarcityToAlert}=require('../lib/inventory-scarcity-alert');

const escalated=applyInventoryScarcityToAlert({alert:true,priority:'standard'},{alertEligible:true,alertPriority:'instant'});
assert.equal(escalated.alert,true);
assert.equal(escalated.priority,'instant');

const cannotCreate=applyInventoryScarcityToAlert({alert:false,priority:'standard'},{alertEligible:true,alertPriority:'instant'});
assert.equal(cannotCreate.alert,false);
assert.equal(cannotCreate.priority,'digest');

const stale=applyInventoryScarcityToAlert({alert:true,priority:'instant'},{alertEligible:true,alertPriority:'digest'});
assert.equal(stale.priority,'digest');

const unavailable=applyInventoryScarcityToAlert({alert:true,priority:'instant'},{alertEligible:false,alertPriority:'digest'});
assert.equal(unavailable.alert,false);
assert.equal(unavailable.priority,'digest');

console.log('inventory scarcity alert tests passed');
