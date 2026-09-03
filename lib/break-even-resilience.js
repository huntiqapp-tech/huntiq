(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQBreakEvenResilience=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function assessBreakEvenResilience({salePrice=0,acquisitionCost=0,marketplaceFeePct=13.25,paymentFeePct=0,paymentFixedFee=0.30,shippingCost=0,shippingSubsidy=0,packagingCost=0,returnReservePct=3,taxDragPct=0,minNetProfit=8,minRoiPct=25,anomalyConfidence=100,resaleConfidence=100,evidenceConfidence=100,alertState='instant'}={}){
 salePrice=Math.max(0,Number(salePrice)||0);acquisitionCost=Math.max(0,Number(acquisitionCost)||0);marketplaceFeePct=clamp(marketplaceFeePct,0,60);paymentFeePct=clamp(paymentFeePct,0,20);returnReservePct=clamp(returnReservePct,0,40);taxDragPct=clamp(taxDragPct,0,20);
 const variableRate=(marketplaceFeePct+paymentFeePct+returnReservePct+taxDragPct)/100;
 const netRate=Math.max(.01,1-variableRate);
 const fixedCosts=Math.max(0,Number(paymentFixedFee)||0)+Math.max(0,Number(shippingCost)||0)-Math.max(0,Number(shippingSubsidy)||0)+Math.max(0,Number(packagingCost)||0);
 const netProfit=money(salePrice*netRate-acquisitionCost-fixedCosts);
 const roiPct=acquisitionCost>0?+(netProfit/acquisitionCost*100).toFixed(1):0;
 const profitFloorSalePrice=(Number(minNetProfit||0)+acquisitionCost+fixedCosts)/netRate;
 const roiFloorSalePrice=(acquisitionCost*(1+Number(minRoiPct||0)/100)+fixedCosts)/netRate;
 const requiredSalePrice=Math.max(profitFloorSalePrice,roiFloorSalePrice);
 const salePriceCushion=money(Math.max(0,salePrice-requiredSalePrice));
 const salePriceCushionPct=salePrice>0?+(salePriceCushion/salePrice*100).toFixed(1):0;
 const maxAcquisitionForProfit=Math.max(0,salePrice*netRate-fixedCosts-Number(minNetProfit||0));
 const maxAcquisitionForRoi=(salePrice*netRate-fixedCosts)/(1+Number(minRoiPct||0)/100);
 const maxAcquisitionCost=money(Math.max(0,Math.min(maxAcquisitionForProfit,maxAcquisitionForRoi)));
 const acquisitionCostCushion=money(Math.max(0,maxAcquisitionCost-acquisitionCost));
 const acquisitionCostCushionPct=acquisitionCost>0?+(acquisitionCostCushion/acquisitionCost*100).toFixed(1):0;
 const weakestConfidence=clamp(Math.min(anomalyConfidence,resaleConfidence,evidenceConfidence),0,100);
 const confidencePenalty=clamp((80-weakestConfidence)*.45,0,22.5);
 const resilienceScore=Math.round(clamp(Math.min(salePriceCushionPct*4,100)*.55+Math.min(acquisitionCostCushionPct*3,100)*.25+weakestConfidence*.20-confidencePenalty,0,100));
 let band=resilienceScore>=80?'strong':resilienceScore>=60?'moderate':resilienceScore>=40?'thin':'fragile';
 const blockers=[];const warnings=[];
 if(netProfit<Number(minNetProfit||0))blockers.push('profit-floor-not-met');
 if(roiPct<Number(minRoiPct||0))blockers.push('roi-floor-not-met');
 if(salePriceCushionPct<5)blockers.push('sale-price-cushion-fragile');else if(salePriceCushionPct<12)warnings.push('thin-sale-price-cushion');
 if(acquisitionCostCushionPct<5)warnings.push('thin-acquisition-cost-cushion');
 if(weakestConfidence<60)warnings.push('weak-evidence-reduces-resilience');
 let stressedAlertState=String(alertState||'instant').toLowerCase();if(blockers.length)stressedAlertState='digest';else if((band==='thin'||warnings.length)&&stressedAlertState==='instant')stressedAlertState='standard';
 return{salePrice:money(salePrice),acquisitionCost:money(acquisitionCost),netProfit,roiPct,requiredSalePrice:money(requiredSalePrice),salePriceCushion,salePriceCushionPct,maxAcquisitionCost,acquisitionCostCushion,acquisitionCostCushionPct,weakestConfidence:Math.round(weakestConfidence),resilienceScore,band,minNetProfit:money(minNetProfit),minRoiPct:+Number(minRoiPct||0).toFixed(1),eligibleForUrgentAlert:blockers.length===0,stressedAlertState,warnings,blockers};
}
return{assessBreakEvenResilience};
});
