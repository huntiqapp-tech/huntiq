(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQBuyQuantityOptimizer=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+((Number(n)||0).toFixed(2));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function optimizeBuyQuantity({maxAvailable=1,unitCost=0,unitNetProfit=0,soldCount30=0,soldCount90=0,estimatedDaysToSell=30,resaleConfidence=0,anomalyConfidence=0,evidenceScore=0,maxCapital=Infinity,max90dCapitalAtRiskPct=35,minMarginalRoiPct=20}={}){
  const available=Math.max(1,Math.floor(Number(maxAvailable)||1));
  const cost=Math.max(0,Number(unitCost)||0);const profit=Number(unitNetProfit)||0;
  const sold30=Math.max(0,Number(soldCount30)||0);const sold90=Math.max(sold30,Number(soldCount90)||0);
  const monthlyDemand=sold30>0?sold30:sold90/3;const days=Math.max(1,Number(estimatedDaysToSell)||30);
  const confidence=clamp(Math.min(Number(resaleConfidence)||0,Number(anomalyConfidence)||0,Number(evidenceScore)||0),0,100);
  const capitalCeiling=Number.isFinite(Number(maxCapital))?Math.max(0,Number(maxCapital)):Infinity;
  const rows=[];let recommended=0;
  for(let q=1;q<=available;q++){
    const outlay=cost*q;const capacity90=monthlyDemand*3;const expectedSold90=Math.min(q,Math.floor(capacity90+1e-9));
    const remaining90=Math.max(0,q-expectedSold90);const capitalAtRisk90=remaining90*cost;const capitalAtRiskPct=outlay>0?capitalAtRisk90/outlay*100:0;
    const demandCoverage=monthlyDemand>0?monthlyDemand/q:0;const liquidationDays=monthlyDemand>0?Math.max(days,30*q/monthlyDemand):180;
    const confidenceHaircut=1-(100-confidence)/200;const realizedProfit90=expectedSold90*profit*confidenceHaircut;
    const marginalRoi=cost>0?profit*confidenceHaircut/cost*100:0;
    const blockers=[];if(outlay>capitalCeiling)blockers.push('capital-budget-exceeded');if(q>1&&monthlyDemand<=0)blockers.push('multi-unit-demand-unproven');if(capitalAtRiskPct>max90dCapitalAtRiskPct)blockers.push('capital-at-risk-floor-failed');if(marginalRoi<minMarginalRoiPct)blockers.push('marginal-roi-floor-failed');
    const supported=blockers.length===0;rows.push({quantity:q,capitalOutlay:money(outlay),monthlyDemand:round(monthlyDemand,2),demandCoverageRatio:round(demandCoverage,2),expectedUnitsSold90:expectedSold90,remainingUnits90:remaining90,capitalAtRisk90:money(capitalAtRisk90),capitalAtRisk90Pct:round(capitalAtRiskPct),estimatedLiquidationDays:round(liquidationDays),confidenceScore:Math.round(confidence),confidenceAdjustedProfit90:money(realizedProfit90),confidenceAdjustedMarginalRoiPct:round(marginalRoi),supported,blockers});if(supported)recommended=q;
  }
  if(recommended===0)recommended=1;
  const selected=rows[recommended-1]||rows[0];const warnings=[];if(recommended<available)warnings.push('do-not-buy-all-available');if(selected&&selected.estimatedLiquidationDays>60)warnings.push('slow-capital-recovery');if(confidence<60)warnings.push('low-cross-domain-confidence');
  let alertState='instant';if(confidence<45||!selected||selected.blockers.length)alertState='digest';else if(recommended<available||selected.estimatedLiquidationDays>45||confidence<75)alertState='standard';
  return{maxAvailable:available,recommendedQuantity:recommended,monthlyDemand:round(monthlyDemand,2),confidenceScore:Math.round(confidence),max90dCapitalAtRiskPct:round(max90dCapitalAtRiskPct),minMarginalRoiPct:round(minMarginalRoiPct),selected,quantityCurve:rows,warnings,alertState,alertEligible:alertState!=='digest'};
}
return{optimizeBuyQuantity};
});