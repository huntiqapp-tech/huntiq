(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQChannels=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function evaluateChannel(opportunity={},channel={}){
  const resale=opportunity.resale||{};
  const buyPrice=Math.max(0,Number(opportunity.price)||0);
  const salePrice=Math.max(0,Number(channel.salePrice!=null?channel.salePrice:(resale.marketValue||0))||0);
  const feeRate=clamp(channel.feeRate==null?(opportunity.feeRate==null?0:opportunity.feeRate):channel.feeRate,0,.95);
  const fixedFee=Math.max(0,Number(channel.fixedFee)||0);
  const shipping=Math.max(0,Number(channel.shipping==null?opportunity.shipping:channel.shipping)||0);
  const miscCost=Math.max(0,Number(channel.miscCost==null?opportunity.miscCost:channel.miscCost)||0);
  const taxRate=Math.max(0,Number(opportunity.taxRate)||0);
  const holdingDays=Math.max(0,Number(channel.holdingDays==null?(resale.estimatedDaysToSell||opportunity.holdingDays):channel.holdingDays)||0);
  const holdingCostPerDay=Math.max(0,Number(opportunity.holdingCostPerDay)||0);
  const purchaseTax=buyPrice*taxRate;
  const holdingCost=holdingDays*holdingCostPerDay;
  const variableFee=salePrice*feeRate;
  const totalFees=variableFee+fixedFee;
  const totalCost=buyPrice+purchaseTax+shipping+miscCost+holdingCost;
  const profit=salePrice-totalFees-totalCost;
  const roi=totalCost>0?profit/totalCost*100:0;
  const margin=salePrice>0?profit/salePrice*100:0;
  const breakEvenSalePrice=(totalCost+fixedFee)/Math.max(.05,1-feeRate);
  const marginOfSafety=salePrice>0?(salePrice-breakEvenSalePrice)/salePrice*100:0;
  const maxBuyPrice=Math.max(0,(salePrice*(1-feeRate)-fixedFee-shipping-miscCost-holdingCost)/(1+taxRate));
  const confidence=clamp(channel.confidence==null?(resale.resaleConfidence==null?50:resale.resaleConfidence):channel.confidence,0,100);
  const confidenceFactor=.55+.45*(confidence/100);
  const confidenceAdjustedProfit=profit*confidenceFactor;
  const safetyScore=clamp(marginOfSafety*2.5,0,100);
  const score=clamp(.40*clamp(roi/1.5,0,100)+.30*clamp(confidenceAdjustedProfit/2,0,100)+.15*confidence+.15*safetyScore,0,100);
  return{name:channel.name||channel.marketplace||'Unknown',salePrice:money(salePrice),feeRate:+feeRate.toFixed(4),variableFee:money(variableFee),fixedFee:money(fixedFee),totalFees:money(totalFees),shipping:money(shipping),holdingDays:+holdingDays.toFixed(1),holdingCost:money(holdingCost),totalCost:money(totalCost),profit:money(profit),roi:+roi.toFixed(1),margin:+margin.toFixed(1),breakEvenSalePrice:money(breakEvenSalePrice),marginOfSafety:+marginOfSafety.toFixed(1),maxBuyPrice:money(maxBuyPrice),confidence:+confidence.toFixed(1),confidenceFactor:+confidenceFactor.toFixed(3),confidenceAdjustedProfit:money(confidenceAdjustedProfit),score:Math.round(score)};
}
function compareChannels(opportunity={},channels=[]){
  const evaluated=(channels||[]).map(c=>evaluateChannel(opportunity,c)).filter(x=>x.salePrice>0).sort((a,b)=>b.score-a.score||b.marginOfSafety-a.marginOfSafety||b.confidenceAdjustedProfit-a.confidenceAdjustedProfit||b.roi-a.roi);
  return{best:evaluated[0]||null,alternatives:evaluated.slice(1),channels:evaluated,spread:evaluated.length>1?{profit:money(evaluated[0].profit-evaluated[evaluated.length-1].profit),roi:+(evaluated[0].roi-evaluated[evaluated.length-1].roi).toFixed(1),safety:+(evaluated[0].marginOfSafety-evaluated[evaluated.length-1].marginOfSafety).toFixed(1)}:{profit:0,roi:0,safety:0}};
}
return{evaluateChannel,compareChannels};
});