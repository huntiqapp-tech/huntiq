(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQMarketSpreadRisk=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));const money=n=>+(Number(n)||0).toFixed(2);
function assessMarketSpreadRisk({marketValue=0,resaleDispersion=0,retailerMadPct=0,retailerRegimeStabilityScore=100,purchaseQuantity=1,resaleConfidence=100}={}){
  marketValue=Math.max(0,Number(marketValue)||0);const resaleDispersionPct=Math.max(0,Number(resaleDispersion)||0)*100;const retailVolatilityPct=Math.max(0,Number(retailerMadPct)||0);purchaseQuantity=Math.max(1,Math.floor(Number(purchaseQuantity)||1));
  const resaleRisk=clamp(resaleDispersionPct*2.2,0,100);const retailRisk=clamp(retailVolatilityPct*3,0,100);const regimeRisk=clamp(100-Number(retailerRegimeStabilityScore==null?100:retailerRegimeStabilityScore),0,100);const quantityRisk=clamp((purchaseQuantity-1)*8,0,40);const confidenceRisk=clamp(70-Number(resaleConfidence||0),0,50);
  const riskIndex=clamp(.42*resaleRisk+.20*retailRisk+.18*regimeRisk+.12*quantityRisk+.08*confidenceRisk,0,100);const score=Math.round(100-riskIndex);const haircutPct=+clamp(riskIndex*.18+quantityRisk*.06,0,25).toFixed(1);const conservativeSalePrice=money(marketValue*(1-haircutPct/100));
  const band=score>=80?'stable':score>=65?'moderate':score>=45?'elevated':'high';const warnings=[];const blockers=[];if(band==='elevated')warnings.push('wide-market-price-spread');if(band==='high')blockers.push('unstable-market-price-spread');if(purchaseQuantity>1&&haircutPct>=10)warnings.push('multi-unit-spread-risk');
  return{score,band,riskIndex:+riskIndex.toFixed(1),haircutPct,marketValue:money(marketValue),conservativeSalePrice,resaleDispersionPct:+resaleDispersionPct.toFixed(1),retailerMadPct:+retailVolatilityPct.toFixed(1),retailerRegimeStabilityScore:Math.round(clamp(retailerRegimeStabilityScore,0,100)),purchaseQuantity,resaleConfidence:Math.round(clamp(resaleConfidence,0,100)),warnings,blockers};
}
return{assessMarketSpreadRisk};
});