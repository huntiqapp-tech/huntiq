'use strict';
const assert=require('assert');
const {evaluateAcquisition}=require('../lib/acquisition-cost');

const result=evaluateAcquisition({
  price:180,
  acquisition:{
    stickerPrice:180,
    multiBuyPromotion:{
      type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'sku',
      limitMayApply:true,
      items:[{id:'sku',quantity:6,unitPrice:30,eligible:true}]
    }
  }
});

assert.equal(result.multiBuyPromotionStatus,'unknown');
assert.equal(result.multiBuyPromotionEligible,false);
assert.equal(result.multiBuyDiscount,0);
assert.equal(result.checkoutPrice,180);
assert.equal(result.cashOutlay,180);
assert.equal(result.combinedPromotionEligible,false);
assert(result.multiBuyPromotionReasons.includes('multibuy-redemption-limit-unknown'));
assert(result.warnings.some(w=>w.includes('Multi-buy savings excluded')));

console.log('unknown-promotion-limit integration tests passed');
