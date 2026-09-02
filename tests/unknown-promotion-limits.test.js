'use strict';
const assert=require('assert');
const {evaluateMultiBuyPromotion}=require('../lib/multibuy-promotions');

const unknown=evaluateMultiBuyPromotion({
  type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'sku',
  limitMayApply:true,
  items:[{id:'sku',quantity:6,unitPrice:30,eligible:true}]
});
assert.equal(unknown.status,'unknown');
assert.equal(unknown.redemptionLimitKnown,false);
assert.equal(unknown.availableRedemptions,2);
assert.equal(unknown.appliedRedemptions,1);
assert.equal(unknown.guaranteedRedemptions,1);
assert.equal(unknown.uncertainRedemptions,1);
assert.equal(unknown.totalDiscount,30);
assert.equal(unknown.currentItemEffectiveCost,150);
assert(unknown.warnings.some(w=>w.includes('limit may apply')));

const explicit=evaluateMultiBuyPromotion({
  type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'sku',
  redemptionLimit:2,
  items:[{id:'sku',quantity:6,unitPrice:30,eligible:true}]
});
assert.equal(explicit.status,'eligible');
assert.equal(explicit.redemptionLimitKnown,true);
assert.equal(explicit.appliedRedemptions,2);
assert.equal(explicit.totalDiscount,60);
assert.equal(explicit.currentItemEffectiveCost,120);

const single=evaluateMultiBuyPromotion({
  type:'cheapest-item-free',requiredQuantity:3,basketComplete:true,currentItemId:'sku',
  redemptionLimitKnown:false,
  items:[{id:'sku',quantity:3,unitPrice:25,eligible:true}]
});
assert.equal(single.status,'eligible');
assert.equal(single.availableRedemptions,1);
assert.equal(single.uncertainRedemptions,0);
assert.equal(single.totalDiscount,25);

console.log('unknown-promotion-limits tests passed');
