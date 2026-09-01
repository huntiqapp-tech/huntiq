const assert=require('assert');
const A=require('../lib/acquisition-cost.js');
const C=require('../lib/channel-economics.js');

const plain=A.evaluateAcquisition({price:100,taxRate:.06});
assert.strictEqual(plain.checkoutPrice,100);
assert.strictEqual(plain.purchaseTax,6);
assert.strictEqual(plain.cashOutlay,106);
assert.strictEqual(plain.expectedFutureCredit,0);
assert.strictEqual(plain.economicAcquisitionCost,106);

const instant=A.evaluateAcquisition({price:100,taxRate:.06,acquisition:{instantDiscount:10,checkoutCredit:5}});
assert.strictEqual(instant.checkoutPrice,85,'instant discounts and checkout credits should lower checkout price');
assert.strictEqual(instant.cashOutlay,90.1,'tax should apply to the reduced checkout price by default');

const rebate=A.evaluateAcquisition({price:100,taxRate:.06,acquisition:{futureCredit:11,futureCreditType:'rebate-credit',realizationRate:1,daysToCredit:0,annualDiscountRate:0}});
assert.strictEqual(rebate.checkoutPrice,100,'future rebate must not reduce checkout price');
assert.strictEqual(rebate.cashOutlay,106,'future rebate must not reduce cash paid today');
assert.strictEqual(rebate.expectedFutureCredit,11);
assert.strictEqual(rebate.economicAcquisitionCost,95);
assert(rebate.warning,'deferred value should carry a customer-facing warning');

const uncertain=A.evaluateAcquisition({price:100,acquisition:{futureCredit:20,realizationRate:.5,daysToCredit:90,annualDiscountRate:.1}});
assert(uncertain.expectedFutureCredit<10,'time value should discount a delayed partially-realized future credit');
assert(uncertain.expectedFutureCredit>0);

const channel=C.evaluateChannel({price:100,taxRate:.06,acquisition:{futureCredit:11,futureCreditType:'rebate-credit',realizationRate:1,daysToCredit:0,annualDiscountRate:0},resale:{marketValue:150,resaleConfidence:90}},{name:'Test market',salePrice:150,feeRate:0,confidence:90});
assert.strictEqual(channel.cashAcquisitionOutlay,106);
assert.strictEqual(channel.expectedFutureCredit,11);
assert.strictEqual(channel.capitalOutlay,106);
assert.strictEqual(channel.profit,55,'profit may include expected rebate value without pretending checkout was cheaper');
assert.strictEqual(channel.roi,51.9,'cash ROI denominator should remain actual capital paid');
assert(channel.economicRoi>channel.roi,'economic ROI may separately reflect expected deferred value');

console.log('HUNTIQ acquisition cost tests passed',{plain,instant,rebate,channel});
