(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./basket-promotions'):root.HuntIQBasketPromotions);if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAcquisitionCost=api;})(typeof globalThis!=='undefined'?globalThis:this,function(BasketPromotions){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const validDate=v=>{if(v==null||v==='')return null;const t=Date.parse(v);return Number.isFinite(t)?t:null;};
function evaluatePromotion(opportunity={},stickerPrice=0){
  const acquisition=opportunity.acquisition||{};
  const promotion=acquisition.promotion||null;
  if(!promotion)return{status:'eligible',eligible:true,known:true,reasons:[],warnings:[],promotion:null};
  const reasons=[];const warnings=[];
  const membershipRequired=Boolean(promotion.membershipRequired||promotion.requiresMembership);
  const couponRequired=Boolean(promotion.couponRequired||promotion.requiresCoupon);
  const minimumSpend=Math.max(0,Number(promotion.minimumSpend)||0);
  const evaluationTime=validDate(promotion.evaluationTime||acquisition.evaluationTime||opportunity.observedAt)||Date.now();
  const startsAt=validDate(promotion.startsAt);
  const expiresAt=validDate(promotion.expiresAt);
  if(membershipRequired){if(promotion.memberEligible===false)reasons.push('membership-not-eligible');else if(promotion.memberEligible!==true)reasons.push('membership-eligibility-unknown');}
  if(couponRequired){if(promotion.couponApplied===false)reasons.push('required-coupon-not-applied');else if(promotion.couponApplied!==true)reasons.push('coupon-application-unknown');}
  if(minimumSpend>0&&stickerPrice<minimumSpend)reasons.push('minimum-spend-not-met');
  if(startsAt!=null&&evaluationTime<startsAt)reasons.push('promotion-not-started');
  if(expiresAt!=null&&evaluationTime>expiresAt)reasons.push('promotion-expired');
  if(promotion.channelEligible===false)reasons.push('channel-not-eligible');else if(promotion.channelEligible==null&&promotion.channelRestricted===true)reasons.push('channel-eligibility-unknown');
  if(promotion.itemEligible===false)reasons.push('item-excluded');else if(promotion.itemEligible==null&&promotion.itemRestricted===true)reasons.push('item-eligibility-unknown');
  if(promotion.stackable===false&&(Number(acquisition.instantDiscount)||0)>0&&(Number(acquisition.checkoutCredit)||0)>0)reasons.push('nonstackable-discounts-combined');
  if(promotion.singleUse===true)warnings.push('single-use-promotion');
  if(expiresAt!=null&&evaluationTime<=expiresAt&&(expiresAt-evaluationTime)<=24*60*60*1000)warnings.push('promotion-expires-within-24h');
  const eligible=reasons.length===0;
  const unknown=reasons.some(r=>r.endsWith('-unknown'));
  return{status:eligible?'eligible':unknown?'unknown':'ineligible',eligible,known:!unknown,reasons,warnings,promotion:{membershipRequired,couponRequired,minimumSpend,startsAt:promotion.startsAt||null,expiresAt:promotion.expiresAt||null,stackable:promotion.stackable!==false,singleUse:Boolean(promotion.singleUse)}};
}
function evaluateBasketPromotion(acquisition={}){
  if(!acquisition.basketPromotion)return null;
  if(!BasketPromotions||typeof BasketPromotions.allocateBasketPromotion!=='function')return{status:'unknown',eligible:false,currentItemAllocation:0,requestedReward:Math.max(0,Number(acquisition.basketPromotion.rewardValue)||0),reasons:['basket-allocation-engine-unavailable'],warnings:[]};
  return BasketPromotions.allocateBasketPromotion(acquisition.basketPromotion);
}
function evaluateAcquisition(opportunity={}){
  const acquisition=opportunity.acquisition||{};
  const stickerPrice=Math.max(0,Number(acquisition.stickerPrice==null?opportunity.price:acquisition.stickerPrice)||0);
  const promotion=evaluatePromotion(opportunity,stickerPrice);
  const basketPromotion=evaluateBasketPromotion(acquisition);
  const basketEligible=!basketPromotion||basketPromotion.eligible;
  const combinedPromotionEligible=promotion.eligible&&basketEligible;
  const combinedPromotionStatus=!promotion.eligible?promotion.status:(basketPromotion&&!basketPromotion.eligible?basketPromotion.status:'eligible');
  const combinedPromotionReasons=[...promotion.reasons,...(basketPromotion?basketPromotion.reasons:[])];
  const basketRewardType=String(acquisition.basketPromotion&&acquisition.basketPromotion.rewardType||'future-credit').toLowerCase();
  const basketAllocation=basketPromotion&&basketPromotion.eligible?Math.max(0,Number(basketPromotion.currentItemAllocation)||0):0;
  const basketInstantDiscount=basketRewardType==='instant-discount'||basketRewardType==='checkout-discount'?basketAllocation:0;
  const basketCheckoutCredit=basketRewardType==='checkout-credit'?basketAllocation:0;
  const basketFutureCredit=basketInstantDiscount===0&&basketCheckoutCredit===0?basketAllocation:0;
  const requestedInstantDiscount=Math.max(0,Number(acquisition.instantDiscount)||0);
  const requestedCheckoutCredit=Math.max(0,Number(acquisition.checkoutCredit)||0);
  const instantDiscount=promotion.eligible?requestedInstantDiscount:0;
  const checkoutCredit=promotion.eligible?requestedCheckoutCredit:0;
  const checkoutPrice=Math.max(0,stickerPrice-instantDiscount-checkoutCredit-(promotion.eligible?basketInstantDiscount+basketCheckoutCredit:0));
  const taxRate=Math.max(0,Number(acquisition.taxRate==null?opportunity.taxRate:acquisition.taxRate)||0);
  const taxablePrice=Math.max(0,Number(acquisition.taxablePrice==null?checkoutPrice:acquisition.taxablePrice)||0);
  const purchaseTax=taxablePrice*taxRate;
  const baseFutureCreditRequested=Math.max(0,Number(acquisition.futureCredit==null?acquisition.rebateCredit:acquisition.futureCredit)||0);
  const futureCreditRequested=baseFutureCreditRequested+Math.max(0,Number(basketPromotion&&basketPromotion.requestedReward)||0);
  const futureCredit=(promotion.eligible?baseFutureCreditRequested:0)+(promotion.eligible?basketFutureCredit:0);
  const realizationRate=clamp(acquisition.realizationRate==null?(futureCredit>0?.8:0):acquisition.realizationRate,0,1);
  const daysToCredit=Math.max(0,Number(acquisition.daysToCredit)||0);
  const annualDiscountRate=clamp(acquisition.annualDiscountRate==null?.08:acquisition.annualDiscountRate,0,1);
  const timeValueFactor=daysToCredit>0?1/Math.pow(1+annualDiscountRate,daysToCredit/365):1;
  const expectedFutureCredit=futureCredit*realizationRate*timeValueFactor;
  const cashOutlay=checkoutPrice+purchaseTax;
  const economicAcquisitionCost=Math.max(0,cashOutlay-expectedFutureCredit);
  const futureCreditType=String(acquisition.futureCreditType||acquisition.rebateType||(basketFutureCredit>0?'basket-reward':'store-credit'));
  const warnings=[];
  if(futureCredit>0)warnings.push('Future rebate/store credit is not an immediate checkout discount.');
  if(!promotion.eligible&&(requestedInstantDiscount>0||requestedCheckoutCredit>0||baseFutureCreditRequested>0))warnings.push('Promotion value excluded until eligibility is confirmed.');
  if(basketPromotion&&!basketPromotion.eligible)warnings.push('Basket-level promotion value excluded until the full qualifying basket is confirmed.');
  if(basketPromotion&&basketPromotion.eligible&&basketPromotion.currentItemAllocation>0)warnings.push('Basket-level reward is allocated only to this item’s proportional share of qualifying spend.');
  return{stickerPrice:money(stickerPrice),requestedInstantDiscount:money(requestedInstantDiscount),requestedCheckoutCredit:money(requestedCheckoutCredit),instantDiscount:money(instantDiscount+(promotion.eligible?basketInstantDiscount:0)),checkoutCredit:money(checkoutCredit+(promotion.eligible?basketCheckoutCredit:0)),checkoutPrice:money(checkoutPrice),taxRate:+taxRate.toFixed(4),taxablePrice:money(taxablePrice),purchaseTax:money(purchaseTax),cashOutlay:money(cashOutlay),requestedFutureCredit:money(futureCreditRequested),futureCredit:money(futureCredit),futureCreditType,realizationRate:+realizationRate.toFixed(3),daysToCredit:+daysToCredit.toFixed(1),annualDiscountRate:+annualDiscountRate.toFixed(4),timeValueFactor:+timeValueFactor.toFixed(4),expectedFutureCredit:money(expectedFutureCredit),economicAcquisitionCost:money(economicAcquisitionCost),hasDeferredValue:futureCredit>0,promotion,promotionEligible:combinedPromotionEligible,promotionStatus:combinedPromotionStatus,promotionReasons:combinedPromotionReasons,promotionWarnings:promotion.warnings,basketPromotion,basketPromotionEligible:basketPromotion?basketPromotion.eligible:true,basketPromotionStatus:basketPromotion?basketPromotion.status:'none',basketPromotionReasons:basketPromotion?basketPromotion.reasons:[],basketAllocatedReward:money(basketAllocation),basketRewardType:basketPromotion?basketRewardType:null,combinedPromotionEligible,warnings,warning:warnings[0]||null};
}
return{evaluatePromotion,evaluateBasketPromotion,evaluateAcquisition};
});