const assert=require('assert');
const {gateMomentumAlert}=require('../lib/opportunity-momentum-alert');

const urgent=gateMomentumAlert({alert:true,priority:'instant'},{score:88,alertEligible:true,blockers:[]});
assert.equal(urgent.alert,true);
assert.equal(urgent.priority,'instant');

const aging=gateMomentumAlert({alert:true,priority:'instant'},{score:64,alertEligible:true,blockers:[]});
assert.equal(aging.alert,true);
assert.equal(aging.priority,'standard');

const compressed=gateMomentumAlert({alert:true,priority:'instant'},{score:42,alertEligible:false,blockers:['persistent markdown and resale compression reduce urgency']});
assert.equal(compressed.alert,false);
assert.equal(compressed.priority,'digest');

console.log('opportunity-momentum-alert tests passed');