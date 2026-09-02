const assert=require('assert');
const MultiBuy=require('../lib/multibuy-promotions.js');
const Acquisition=require('../lib/acquisition-cost.js');
const Channels=require('../lib/channel-economics.js');
const EvidenceGate=require('../lib/evidence-gate.js');

const bogo=MultiBuy.evaluateMultiBuyPromotion({type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]});
assert.strictEqual(bogo.status,'eligible');
assert.strictEqual(bogo.totalDiscount,30);
assert.strictEqual(bogo.currentItemDiscount,30);
assert.strictEqual(bogo.currentItemSpend,90);
assert.strictEqual(bogo.currentItemEffectiveCost,60);
assert.strictEqual(bogo.currentItemEffectiveUnitCost,20);

const cheapest=MultiBuy.evaluateMultiBuyPromotion({type:'cheapest-item-free',requiredQuantity:3,basketComplete:true,currentItemId:'cheap',items:[{id:'premium',price:50,quantity:1},{id:'mid',price:35,quantity:1},{id:'cheap',price:20,quantity:1}]});
assert.strictEqual(cheapest.status,'eligible');
assert.strictEqual(cheapest.totalDiscount,20,'cheapest-item-free must discount the cheapest eligible unit');
assert.strictEqual(cheapest.itemDiscounts.cheap,20);
assert.strictEqual(cheapest.itemDiscounts.premium,undefined);

const tier=MultiBuy.evaluateMultiBuyPromotion({type:'quantity-tier',requiredQuantity:4,discountPercent:25,basketComplete:true,currentItemId:'a',items:[{id:'a',price:20,quantity:4}]});
assert.strictEqual(tier.totalDiscount,20);
assert.strictEqual(tier.currentItemEffectiveUnitCost,15);

const incomplete=MultiBuy.evaluateMultiBuyPromotion({type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:false,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]});
assert.strictEqual(incomplete.status,'unknown');
assert.strictEqual(incomplete.totalDiscount,0,'unconfirmed quantity must never receive optimistic savings');
assert(incomplete.reasons.includes('multibuy-basket-completeness-unconfirmed'));

const insufficient=MultiBuy.evaluateMultiBuyPromotion({type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'a',items:[{id:'a',price:30,quantity:2}]});
assert.strictEqual(insufficient.status,'ineligible');
assert.strictEqual(insufficient.totalDiscount,0);
assert(insufficient.reasons.includes('multibuy-quantity-not-met'));

const acquisition=Acquisition.evaluateAcquisition({price:90,acquisition:{multiBuyPromotion:{type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]}}});
assert.strictEqual(acquisition.multiBuyDiscount,30);
assert.strictEqual(acquisition.checkoutPrice,60,'qualified multi-buy savings may reduce checkout outlay only by the verified item discount');
assert.strictEqual(acquisition.cashOutlay,60);
assert.strictEqual(acquisition.promotionStatus,'eligible');

const unknownAcquisition=Acquisition.evaluateAcquisition({price:90,acquisition:{multiBuyPromotion:{type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:false,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]}}});
assert.strictEqual(unknownAcquisition.multiBuyDiscount,0);
assert.strictEqual(unknownAcquisition.checkoutPrice,90);
assert.strictEqual(unknownAcquisition.promotionStatus,'unknown');
assert(unknownAcquisition.promotionReasons.includes('multibuy-basket-completeness-unconfirmed'));

const channel=Channels.evaluateChannel({price:90,acquisition:{multiBuyPromotion:{type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:true,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]}},resale:{marketValue:105,resaleConfidence:95}},{name:'Test',salePrice:105,feeRate:0,confidence:95});
assert.strictEqual(channel.cashAcquisitionOutlay,60);
assert.strictEqual(channel.profit,45,'profit must use verified multi-buy checkout outlay');
assert.strictEqual(channel.roi,75);

const unknownChannel=Channels.evaluateChannel({price:90,acquisition:{multiBuyPromotion:{type:'buy-x-get-y',buyQuantity:2,getQuantity:1,basketComplete:false,currentItemId:'a',items:[{id:'a',price:30,quantity:3}]}},resale:{marketValue:105,resaleConfidence:95}},{name:'Test',salePrice:105,feeRate:0,confidence:95});
const gated=EvidenceGate.evaluateEvidence({history:{sampleCount:20,spanDays:60,confidence:95,historyCoverageScore:95},anomaly:{confidence:95,phase:'new'},resale:{confidence:95,resaleFreshnessScore:95,soldCount90:20,soldCount30:10,priceIntegrity:100},economics:{...unknownChannel,downsideRoi:unknownChannel.riskAdjustedRoi,confidenceAdjustedRoi:unknownChannel.riskAdjustedRoi,decisionFloorProfit:unknownChannel.riskAdjustedProfit,decisionFloorRoi:unknownChannel.riskAdjustedRoi},deal:{fresh:true,verified:true}});
assert(gated.warnings.includes('promotion-eligibility-unconfirmed'));
assert.notStrictEqual(gated.alertLevel,'instant','unconfirmed multi-buy quantity must not create an instant alert');

console.log('HUNTIQ multi-buy promotion tests passed',{bogo,cheapest,tier,incomplete,acquisition,channel,gated});
