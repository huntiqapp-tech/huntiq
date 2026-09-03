(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQRetailerCrosscheck=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function ageMinutes(ts,asOf){const t=new Date(ts).getTime(),n=new Date(asOf||Date.now()).getTime();return Number.isFinite(t)&&Number.isFinite(n)?(n-t)/60000:Infinity;}
function assessRetailerCrosscheck({providerPrice=0,corroboratedPrice=0,productIdentityMatch=false,channelMatch=false,locationMatch=false,providerObservedAt,corroboratedObservedAt,asOf,providerAnomalyConfidence=0,resaleMedian=0,marketplaceFeePct=13.25,shippingCost=0,packagingCost=0,returnReservePct=3,minNetProfit=8,minRoiPct=25,alertState='instant'}={}){
 providerPrice=Math.max(0,Number(providerPrice)||0);corroboratedPrice=Math.max(0,Number(corroboratedPrice)||0);resaleMedian=Math.max(0,Number(resaleMedian)||0);
 const denominator=Math.max(providerPrice,corroboratedPrice,0.01);const priceDeltaPct=+(Math.abs(providerPrice-corroboratedPrice)/denominator*100).toFixed(1);
 const providerAgeMinutes=ageMinutes(providerObservedAt,asOf),corroboratedAgeMinutes=ageMinutes(corroboratedObservedAt,asOf);const freshest=Math.max(providerAgeMinutes,corroboratedAgeMinutes);
 const priceAgreementScore=priceDeltaPct<=1?100:priceDeltaPct<=3?90:priceDeltaPct<=7?65:priceDeltaPct<=15?35:0;
 const freshnessScore=freshest<=15?100:freshest<=60?85:freshest<=180?60:freshest<=720?30:0;
 const validationScore=Math.round(clamp((productIdentityMatch?30:0)+(channelMatch?15:0)+(locationMatch?15:0)+priceAgreementScore*.25+freshnessScore*.15,0,100));
 const pricesValid=providerPrice>0&&corroboratedPrice>0;const timestampsValid=providerAgeMinutes>=-5&&corroboratedAgeMinutes>=-5&&Number.isFinite(freshest);
 const historyEligible=Boolean(pricesValid&&timestampsValid&&productIdentityMatch&&channelMatch&&locationMatch&&priceDeltaPct<=3&&freshest<=180&&validationScore>=85);
 const conservativeAcquisitionPrice=money(Math.max(providerPrice,corroboratedPrice));
 const variableRate=clamp((Number(marketplaceFeePct)||0)+(Number(returnReservePct)||0),0,80)/100;const saleNet=resaleMedian*(1-variableRate)-Math.max(0,Number(shippingCost)||0)-Math.max(0,Number(packagingCost)||0);
 const expectedNetProfit=money(saleNet-conservativeAcquisitionPrice);const expectedRoiPct=conservativeAcquisitionPrice>0?+(expectedNetProfit/conservativeAcquisitionPrice*100).toFixed(1):0;
 const adjustedAnomalyConfidence=historyEligible?Math.round(clamp(Number(providerAnomalyConfidence)||0,0,100)*(validationScore/100)):0;
 const blockers=[];const warnings=[];
 if(providerPrice<=0)blockers.push('invalid-provider-price');if(corroboratedPrice<=0)blockers.push('invalid-corroborated-price');if(providerAgeMinutes < -5||corroboratedAgeMinutes < -5)blockers.push('future-crosscheck');if(!productIdentityMatch)blockers.push('product-identity-mismatch');if(!channelMatch)blockers.push('channel-mismatch');if(!locationMatch)blockers.push('location-mismatch');if(priceDeltaPct>3)blockers.push('price-not-corroborated');if(freshest>180)blockers.push('crosscheck-stale');
 if(priceDeltaPct>1&&priceDeltaPct<=3)warnings.push('minor-price-drift');if(freshest>60&&freshest<=180)warnings.push('crosscheck-aging');if(expectedNetProfit<Number(minNetProfit||0))blockers.push('profit-floor-not-met');if(expectedRoiPct<Number(minRoiPct||0))blockers.push('roi-floor-not-met');
 const eligibleForUrgentAlert=historyEligible&&validationScore>=90&&blockers.length===0;let stressedAlertState=String(alertState||'instant').toLowerCase();if(!eligibleForUrgentAlert)stressedAlertState=historyEligible&&blockers.every(b=>b==='profit-floor-not-met'||b==='roi-floor-not-met')?'digest':historyEligible?'standard':'digest';
 return{providerPrice:money(providerPrice),corroboratedPrice:money(corroboratedPrice),conservativeAcquisitionPrice,priceDeltaPct,providerAgeMinutes:+providerAgeMinutes.toFixed(1),corroboratedAgeMinutes:+corroboratedAgeMinutes.toFixed(1),validationScore,historyEligible,adjustedAnomalyConfidence,resaleMedian:money(resaleMedian),expectedNetProfit,expectedRoiPct,eligibleForUrgentAlert,stressedAlertState,warnings,blockers};
}
return{assessRetailerCrosscheck};
});
