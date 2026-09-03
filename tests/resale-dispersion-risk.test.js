const assert=require('assert');
const {assessResaleDispersion,applyDispersionAlertGate}=require('../lib/resale-dispersion-risk');

const stable=assessResaleDispersion({soldPrices:[98,100,101,102,103,99,100,101],projectedResale:101,acquisitionCost:55,marketplaceFees:13,shippingCost:8});
assert.equal(stable.dispersionStatus,'stable');
assert.equal(stable.haircutPct,0);
assert.equal(stable.alertAction,'instant');
assert(stable.adjustedProfit>20);

const volatile=assessResaleDispersion({soldPrices:[40,55,60,100,125,150,170,180],projectedResale:130,acquisitionCost:70,marketplaceFees:17,shippingCost:10});
assert(['volatile','extreme'].includes(volatile.dispersionStatus));
assert(volatile.haircutPct>=0.12);
assert(volatile.adjustedResale<130);
assert.notEqual(volatile.alertAction,'instant');

const sparse=assessResaleDispersion({soldPrices:[100,105,110],projectedResale:108,acquisitionCost:80,marketplaceFees:12});
assert.equal(sparse.dispersionStatus,'insufficient');
assert.equal(sparse.blocked,true);
assert.equal(sparse.alertAction,'digest');

const gated=applyDispersionAlertGate({urgency:'instant',id:'x'},volatile);
assert.notEqual(gated.urgency,'instant');
assert.equal(gated.dispersionStatus,volatile.dispersionStatus);

console.log('resale-dispersion-risk tests passed');