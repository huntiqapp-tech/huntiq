const assert=require('assert');
const F=require('../lib/fulfillment');
const strong=F.assess({inventory:{quantity:4,verified:true,pickupAvailable:true},evidenceQuality:.95});
assert(strong.confidence>=90);assert.equal(strong.status,'strong');
const weak=F.assess({fulfillmentConfidence:35,inventory:{quantity:1}});assert.equal(weak.status,'weak');
const unavailable=F.assess({inventory:{quantity:0,verified:true}});assert.equal(unavailable.status,'unavailable');assert.equal(unavailable.confidence,0);
const econ=F.adjustEconomics({profit:100,roi:80},weak);assert.equal(econ.expectedProfit,35);assert.equal(econ.expectedRoi,28);
const a=F.fingerprint({fulfillmentConfidence:35,inventory:{quantity:1}});const b=F.fingerprint({fulfillmentConfidence:85,inventory:{quantity:1}});assert.notEqual(a,b,'material fulfillment confidence changes must alter notification state');
console.log('fulfillment tests passed');