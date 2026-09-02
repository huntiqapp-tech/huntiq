const assert=require('assert');
const MultiBuy=require('../lib/multibuy-promotions.js');
const Acquisition=require('../lib/acquisition-cost.js');
const HistoryAnomaly=require('../lib/history-anomaly.js');

const capped=MultiBuy.evaluateMultiBuyPromotion({
  type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,maxRedemptions:1,currentItemId:'a',
  items:[{id:'a',price:30,quantity:6}]
});
assert.strictEqual(capped.availableRedemptions,2);
assert.strictEqual(capped.appliedRedemptions,1);
assert.strictEqual(capped.totalDiscount,30,'redemption limit must cap total promotion value');
assert(capped.warnings.includes('Promotion redemption limit capped the available multi-buy savings.'));

const uncapped=MultiBuy.evaluateMultiBuyPromotion({
  type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'a',
  items:[{id:'a',price:30,quantity:6}]
});
assert.strictEqual(uncapped.appliedRedemptions,2);
assert.strictEqual(uncapped.totalDiscount,60);

const noMix=MultiBuy.evaluateMultiBuyPromotion({
  type:'cheapest-item-free',requiredQuantity:3,basketComplete:true,mixAndMatch:false,currentItemId:'cat',
  items:[
    {id:'cat',price:12,quantity:2,offerGroup:'cat'},
    {id:'dog',price:10,quantity:1,offerGroup:'dog'}
  ]
});
assert.strictEqual(noMix.status,'ineligible','separate offer groups must not combine when mix-and-match is disabled');
assert.strictEqual(noMix.totalDiscount,0);

const mixed=MultiBuy.evaluateMultiBuyPromotion({
  type:'cheapest-item-free',requiredQuantity:3,basketComplete:true,mixAndMatch:true,currentItemId:'dog',
  items:[
    {id:'cat',price:12,quantity:2,offerGroup:'cat'},
    {id:'dog',price:10,quantity:1,offerGroup:'dog'}
  ]
});
assert.strictEqual(mixed.status,'eligible');
assert.strictEqual(mixed.totalDiscount,10);
assert.strictEqual(mixed.currentItemDiscount,10);

const acquisition=Acquisition.evaluateAcquisition({
  price:180,
  acquisition:{multiBuyPromotion:{
    type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,redemptionLimit:1,currentItemId:'a',
    items:[{id:'a',price:30,quantity:6}]
  }}
});
assert.strictEqual(acquisition.multiBuyDiscount,30);
assert.strictEqual(acquisition.checkoutPrice,150,'acquisition economics must honor redemption caps instead of assuming every possible group is discounted');

const anomaly=HistoryAnomaly.assessHistory({currentPrice:60,asOf:'2026-09-02T00:00:00Z',observations:[
  {price:100,observedAt:'2026-08-01T00:00:00Z',priceBasis:'raw-shelf'},
  {price:99,observedAt:'2026-08-08T00:00:00Z',priceBasis:'raw-shelf'},
  {price:98,observedAt:'2026-08-15T00:00:00Z',priceBasis:'raw-shelf'},
  {price:60,observedAt:'2026-08-22T00:00:00Z',priceBasis:'multibuy-adjusted'}
]});
assert.strictEqual(anomaly.sampleCount,3,'promotion-adjusted effective prices must not become historical shelf-price observations');
assert.strictEqual(anomaly.excludedPromotionObservationCount,1);
assert(anomaly.baseline>98,'raw shelf baseline should remain near the true observed shelf price');

console.log('HUNTIQ promotion limit tests passed',{capped,uncapped,noMix,mixed,acquisition,anomaly});
