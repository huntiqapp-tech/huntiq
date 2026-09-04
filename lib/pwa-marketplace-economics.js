(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./marketplace-cost-floor'):root.HuntIQMarketplaceCostFloor);if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQPWAMarketplaceEconomics=api;})(typeof globalThis!=='undefined'?globalThis:this,function(costFloor){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function assessForOpportunity(deal={},evaluated={},rules={}){
 const resale=evaluated.resale||deal.resale||{};
 const salePrice=Number(resale.marketValue??deal.marketValue??0)||0;
 const acquisitionCost=Number(deal.price??evaluated.price??0)||0;
 const feeRate=Number(deal.feeRate??0.135);
 const marketplaceFeePct=Number.isFinite(Number(deal.marketplaceFeePct))?Number(deal.marketplaceFeePct):feeRate*100;
 const evidenceScore=clamp(Number(evaluated.evidenceQuality??deal.evidenceQuality??deal.dataQuality??1)*100,0,100);
 return costFloor.assessMarketplaceCostFloor({
  salePrice,acquisitionCost,marketplaceFeePct,
  paymentFeePct:deal.paymentFeePct??0,
  paymentFixedFee:deal.paymentFixedFee??0,
  shippingCost:deal.shipping??deal.shippingCost??0,
  buyerShippingRevenue:deal.buyerShippingRevenue??0,
  marketplaceFeeOnShipping:deal.marketplaceFeeOnShipping!==false,
  buyerSalesTax:deal.buyerSalesTax??0,
  marketplaceFeeOnSalesTax:deal.marketplaceFeeOnSalesTax===true,
  shippingSubsidy:deal.shippingSubsidy??0,
  packagingCost:deal.packagingCost??0,
  returnReservePct:deal.returnReservePct??0,
  taxDragPct:deal.taxDragPct??0,
  evidenceScore,
  minNetProfit:rules.minNetProfit??50,
  minRoiPct:rules.minRoiPct??40,
  alertState:'instant'
 });
}
function applyAlertGate(alertDecision={},assessment={}){
 const decision={...alertDecision,reasons:Array.isArray(alertDecision.reasons)?[...alertDecision.reasons]:[]};
 if(!assessment||typeof assessment!=='object')return decision;
 if(!assessment.eligibleForUrgentAlert){decision.alert=false;if(!decision.reasons.includes('marketplace-cost-floor'))decision.reasons.push('marketplace-cost-floor');}
 if(assessment.stressedAlertState==='digest')decision.priority=Math.min(Number(decision.priority)||0,39);
 else if(assessment.stressedAlertState==='standard')decision.priority=Math.min(Number(decision.priority)||0,69);
 decision.marketplaceAlertState=assessment.stressedAlertState||'instant';
 decision.marketplaceEconomics={netProfit:assessment.netProfit,roiPct:assessment.roiPct,evidenceAdjustedProfit:assessment.evidenceAdjustedProfit,evidenceAdjustedRoiPct:assessment.evidenceAdjustedRoiPct,totalCostBasis:assessment.totalCostBasis,roiCostBasis:assessment.roiCostBasis,marketplaceFeeBase:assessment.marketplaceFeeBase,marketplaceFee:assessment.marketplaceFee,fulfillmentCost:assessment.fulfillmentCost,warnings:assessment.warnings||[],blockers:assessment.blockers||[]};
 return decision;
}
return{assessForOpportunity,applyAlertGate};
});