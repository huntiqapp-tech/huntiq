(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQPartialLiquidation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+((Number(n)||0).toFixed(2));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function evaluatePartialLiquidation({purchaseQuantity=1,soldCount30=0,soldCount90=0,capitalOutlay=0,expectedNetProfit=0,resaleConfidence=0}={}){
  const quantity=Math.max(1,Math.floor(Number(purchaseQuantity)||1));
  const sold30=Math.max(0,Number(soldCount30)||0);
  const sold90=Math.max(sold30,Number(soldCount90)||0);
  const monthlyDemand=sold30>0?sold30:sold90/3;
  const costPerUnit=quantity>0?Math.max(0,Number(capitalOutlay)||0)/quantity:0;
  const expectedProfitPerUnit=quantity>0?(Number(expectedNetProfit)||0)/quantity:0;
  const horizons=[30,60,90].map(days=>{
    const capacity=monthlyDemand>0?monthlyDemand*(days/30):0;
    const expectedUnitsSold=Math.min(quantity,Math.floor(capacity+1e-9));
    const remainingUnits=Math.max(0,quantity-expectedUnitsSold);
    const capitalTiedUp=money(remainingUnits*costPerUnit);
    const capitalReleased=money((quantity-remainingUnits)*costPerUnit);
    const expectedRealizedProfit=money(expectedUnitsSold*expectedProfitPerUnit);
    const capitalReleasedPct=capitalOutlay>0?clamp(capitalReleased/Number(capitalOutlay)*100,0,100):100;
    return{days,expectedUnitsSold,remainingUnits,capitalTiedUp,capitalReleased,capitalReleasedPct:round(capitalReleasedPct),expectedRealizedProfit};
  });
  const h30=horizons[0],h60=horizons[1],h90=horizons[2];
  const capitalAtRiskPct=capitalOutlay>0?clamp(h90.capitalTiedUp/Number(capitalOutlay)*100,0,100):0;
  const confidencePenalty=clamp((100-clamp(resaleConfidence,0,100))*.25,0,25);
  const exposurePenalty=clamp(capitalAtRiskPct*.65+confidencePenalty,0,100);
  const partialLiquidationScore=Math.round(clamp(100-exposurePenalty,0,100));
  let band='low';if(quantity<=1)band='single-unit';else if(capitalAtRiskPct>=60)band='high';else if(capitalAtRiskPct>=30)band='elevated';else band='supported';
  const blockers=[];const warnings=[];
  if(quantity>1&&h90.expectedUnitsSold===0)blockers.push('no-90d-partial-liquidation-support');
  else if(quantity>=4&&capitalAtRiskPct>=75)blockers.push('excess-90d-capital-lockup');
  else if(quantity>1&&capitalAtRiskPct>=30)warnings.push('meaningful-90d-capital-lockup');
  if(quantity>1&&h30.remainingUnits>0)warnings.push('partial-liquidation-required');
  return{purchaseQuantity:quantity,monthlyDemand:round(monthlyDemand,2),costPerUnit:money(costPerUnit),expectedProfitPerUnit:money(expectedProfitPerUnit),horizons,capitalAtRisk90:money(h90.capitalTiedUp),capitalAtRisk90Pct:round(capitalAtRiskPct),partialLiquidationScore,band,blockers,warnings};
}
return{evaluatePartialLiquidation};
});