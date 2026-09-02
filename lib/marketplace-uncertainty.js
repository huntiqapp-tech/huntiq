(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQMarketplaceUncertainty=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+((Number(n)||0).toFixed(2));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function assessMarketplaceUncertainty({capitalOutlay=0,lateSale=null,assumptions={}}={}){
  const outlay=Math.max(0,Number(capitalOutlay)||0);const baseProfit=Number(lateSale&&lateSale.profit)||0;const baseRoi=Number(lateSale&&lateSale.roi)||0;const totalGross=Math.max(0,Number(lateSale&&lateSale.totalGross)||0);const totalShipping=Math.max(0,Number(lateSale&&lateSale.totalShipping)||0);
  const feeRateUncertainty=clamp(assumptions.feeRateUncertainty==null?.015:assumptions.feeRateUncertainty,0,.15);const shippingUncertaintyPct=clamp(assumptions.shippingUncertaintyPct==null?10:assumptions.shippingUncertaintyPct,0,100);const fixedCostBuffer=Math.max(0,Number(assumptions.fixedCostBuffer)||0);
  const feeBuffer=money(totalGross*feeRateUncertainty);const shippingBuffer=money(totalShipping*shippingUncertaintyPct/100);const uncertaintyCost=money(feeBuffer+shippingBuffer+fixedCostBuffer);const conservativeProfit=money(baseProfit-uncertaintyCost);const conservativeRoi=outlay>0?round(conservativeProfit/outlay*100,1):baseRoi;const uncertaintyPct=outlay>0?round(uncertaintyCost/outlay*100,1):0;
  const score=Math.round(clamp(100-Math.min(45,uncertaintyPct*2)-Math.min(20,feeRateUncertainty*500)-Math.min(15,shippingUncertaintyPct/4),0,100));const blockers=[];const warnings=[];if(baseProfit>0&&conservativeProfit<=0)blockers.push('marketplace-cost-uncertainty-erases-profit');else if(conservativeRoi<10)warnings.push('thin-roi-after-marketplace-cost-uncertainty');if(uncertaintyCost>0)warnings.push('marketplace-cost-uncertainty-buffer-applied');
  return{feeRateUncertainty:round(feeRateUncertainty,4),shippingUncertaintyPct:round(shippingUncertaintyPct,1),fixedCostBuffer:money(fixedCostBuffer),feeBuffer,shippingBuffer,uncertaintyCost,baseProfit:money(baseProfit),baseRoi:round(baseRoi,1),conservativeProfit,conservativeRoi,uncertaintyPct,score,blockers,warnings};
}
return{assessMarketplaceUncertainty};
});