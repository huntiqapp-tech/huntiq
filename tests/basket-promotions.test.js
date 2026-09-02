const assert=require('assert');
const Basket=require('../lib/basket-promotions.js');
const Acquisition=require('../lib/acquisition-cost.js');
const Channels=require('../lib/channel-economics.js');

const basket={
  basketComplete:true,
  threshold:250,
  rewardValue:25,
  rewardType:'future-credit',
  currentItemId:'a',
  items:[
    {id:'a',price:100,quantity:1,eligible:true},
    {id:'b',price:150,quantity:1,eligible:true}
  ]
};
const allocation=Basket.allocateBasketPromotion(basket);
assert.strictEqual(allocation.status,'eligible');
assert.strictEqual(allocation.qualifyingSpend,250);
assert.strictEqual(allocation.allocatedTotal,25);
assert.strictEqual(allocation.allocations.a,10,'$100 of a $250 basket should receive 40% of a $25 reward');
assert.strictEqual(allocation.allocations.b,15);

const incomplete=Basket.allocateBasketPromotion({...basket,basketComplete:false});
assert.strictEqual(incomplete.status,'unknown');
assert.strictEqual(incomplete.currentItemAllocation,0,'incomplete baskets must receive no optimistic allocation');
assert(incomplete.reasons.includes('basket-completeness-unconfirmed'));

const belowThreshold=Basket.allocateBasketPromotion({...basket,threshold:300});
assert.strictEqual(belowThreshold.status,'ineligible');
assert.strictEqual(belowThreshold.allocatedTotal,0);
assert(belowThreshold.reasons.includes('basket-threshold-not-met'));

const mixedEligibility=Basket.allocateBasketPromotion({...basket,threshold:100,items:[{id:'a',price:100,eligible:true},{id:'b',price:150,eligible:false}]});
assert.strictEqual(mixedEligibility.qualifyingSpend,100,'excluded lines must not earn allocation');
assert.strictEqual(mixedEligibility.currentItemAllocation,25);
assert.strictEqual(mixedEligibility.allocations.b,undefined);

const acquisition=Acquisition.evaluateAcquisition({price:100,acquisition:{realizationRate:1,daysToCredit:0,annualDiscountRate:0,basketPromotion:basket}});
assert.strictEqual(acquisition.checkoutPrice,100,'future basket rewards must not reduce checkout cash price');
assert.strictEqual(acquisition.basketAllocatedReward,10);
assert.strictEqual(acquisition.futureCredit,10,'only this SKU share of basket reward may enter its economics');
assert.strictEqual(acquisition.expectedFutureCredit,10);

const incompleteAcquisition=Acquisition.evaluateAcquisition({price:100,acquisition:{realizationRate:1,basketPromotion:{...basket,basketComplete:false}}});
assert.strictEqual(incompleteAcquisition.basketAllocatedReward,0);
assert.strictEqual(incompleteAcquisition.futureCredit,0);
assert.strictEqual(incompleteAcquisition.basketPromotionStatus,'unknown');

const checkoutBasket=Acquisition.evaluateAcquisition({price:100,acquisition:{basketPromotion:{...basket,rewardType:'instant-discount'}}});
assert.strictEqual(checkoutBasket.checkoutPrice,90,'qualified basket checkout discounts may reduce only the allocated SKU share');
assert.strictEqual(checkoutBasket.cashOutlay,90);

const channel=Channels.evaluateChannel({price:100,acquisition:{realizationRate:1,daysToCredit:0,annualDiscountRate:0,basketPromotion:basket},resale:{marketValue:150,resaleConfidence:90}},{name:'Test',salePrice:150,feeRate:0,confidence:90});
assert.strictEqual(channel.cashAcquisitionOutlay,100);
assert.strictEqual(channel.expectedFutureCredit,10);
assert.strictEqual(channel.profit,60,'profit may include only the allocated basket reward, never the full basket reward');
assert.strictEqual(channel.roi,60);

console.log('HUNTIQ basket promotion tests passed',{allocation,incomplete,belowThreshold,acquisition,channel});
