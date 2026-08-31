(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQResaleOutcome=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function assess(opportunity={},options={}){
  const resale=opportunity.resale||{};
  const sold30=Math.max(0,Number(resale.sold30||resale.soldCount30||0));
  const active=Math.max(0,Number(resale.activeCount||resale.activeListings||0));
  const confidence=clamp(resale.resaleConfidence==null?50:resale.resaleConfidence,0,100);
  const horizonDays=Math.max(1,Number(options.horizonDays||30));
  const monthlyDemand=sold30*(horizonDays/30);
  const queue=active+1;
  const demandCoverage=queue>0?monthlyDemand/queue:monthlyDemand;
  const velocityProbability=1-Math.exp(-Math.max(0,demandCoverage));
  const confidenceFactor=.45+.55*(confidence/100);
  const sellThroughProbability=clamp(velocityProbability*confidenceFactor,0,.995);
  const econ=opportunity.economics||{};
  const profit=Number(econ.profit)||0;
  const roi=Number(econ.roi)||0;
  const liquidationProfit=Number(opportunity.risk&&opportunity.risk.liquidation&&opportunity.risk.liquidation.economics&&opportunity.risk.liquidation.economics.profit);
  const fallbackProfit=Number.isFinite(liquidationProfit)?liquidationProfit:Math.min(0,profit*.25);
  const expectedProfit=profit*sellThroughProbability+fallbackProfit*(1-sellThroughProbability);
  const expectedRoi=roi*sellThroughProbability+(roi<0?roi:0)*(1-sellThroughProbability);
  const status=sellThroughProbability>=.75?'strong':sellThroughProbability>=.5?'moderate':sellThroughProbability>=.3?'thin':'weak';
  return{horizonDays,sold30,active,confidence:+confidence.toFixed(1),demandCoverage:+demandCoverage.toFixed(3),sellThroughProbability:+sellThroughProbability.toFixed(3),sellThroughPct:+(sellThroughProbability*100).toFixed(1),expectedProfit:money(expectedProfit),expectedRoi:+expectedRoi.toFixed(1),fallbackProfit:money(fallbackProfit),status};
}
function fingerprint(opportunity={},options={}){const a=assess(opportunity,options);const p=Math.floor(a.sellThroughPct/10)*10;const ep=Math.floor(a.expectedProfit/25)*25;return['sell',a.status,p,ep,a.sold30,a.active].join(':');}
return{assess,fingerprint};
});