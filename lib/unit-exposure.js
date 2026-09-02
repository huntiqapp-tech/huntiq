(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQUnitExposure=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function evaluateUnitExposure({purchaseQuantity=1,soldCount30=0,soldCount90=0,estimatedDaysToSell=30,resaleConfidence=0}={}){
  const quantity=Math.max(1,Math.floor(Number(purchaseQuantity)||1));
  const sold30=Math.max(0,Number(soldCount30)||0);
  const sold90=Math.max(sold30,Number(soldCount90)||0);
  const monthlyDemand=sold30>0?sold30:sold90/3;
  const demandCoverageRatio=monthlyDemand>0?monthlyDemand/quantity:0;
  const liquidationDays=monthlyDemand>0?Math.max(Number(estimatedDaysToSell)||30,30*quantity/monthlyDemand):180;
  const quantityPenalty=quantity<=1?0:clamp((quantity-1)*7,0,35);
  const coverageScore=clamp(demandCoverageRatio*100,0,100);
  const liquidationScore=clamp(100-(liquidationDays-14)*.7,0,100);
  const confidenceScore=clamp(resaleConfidence,0,100);
  const exposureScore=clamp(coverageScore*.5+liquidationScore*.3+confidenceScore*.2-quantityPenalty,0,100);
  let exposureBand='normal';
  if(quantity<=1)exposureBand='single-unit';
  else if(exposureScore<30||liquidationDays>120)exposureBand='high';
  else if(exposureScore<55||liquidationDays>60)exposureBand='elevated';
  else exposureBand='supported';
  const blockers=[];const warnings=[];
  if(quantity>1&&monthlyDemand<=0)blockers.push('multi-unit-resale-demand-unproven');
  else if(quantity>=4&&demandCoverageRatio<.5)blockers.push('multi-unit-resale-capacity-insufficient');
  else if(quantity>1&&demandCoverageRatio<1)warnings.push('multi-unit-resale-exposure');
  if(liquidationDays>90)warnings.push('extended-multi-unit-liquidation');
  return{purchaseQuantity:quantity,soldCount30:sold30,soldCount90:sold90,monthlyDemand:round(monthlyDemand,2),demandCoverageRatio:round(demandCoverageRatio,2),estimatedLiquidationDays:round(liquidationDays),quantityPenalty:round(quantityPenalty),exposureScore:Math.round(exposureScore),exposureBand,blockers,warnings};
}
return{evaluateUnitExposure};
});