(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQResaleOutcome=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function demandPerDay(resale={}){const s7=Number(resale.sold7||resale.soldCount7),s30=Number(resale.sold30||resale.soldCount30),s90=Number(resale.sold90||resale.soldCount90);const parts=[];if(Number.isFinite(s7))parts.push([Math.max(0,s7)/7,.5]);if(Number.isFinite(s30))parts.push([Math.max(0,s30)/30,parts.length?.35:1]);if(Number.isFinite(s90))parts.push([Math.max(0,s90)/90,parts.length?.15:1]);if(!parts.length)return 0;const weight=parts.reduce((a,p)=>a+p[1],0)||1;return parts.reduce((a,p)=>a+p[0]*p[1],0)/weight;}
function assess(opportunity={},options={}){
  const resale=opportunity.resale||{};
  const sold30=Math.max(0,Number(resale.sold30||resale.soldCount30||0));
  const active=Math.max(0,Number(resale.activeCount||resale.activeListings||0));
  const confidence=clamp(resale.resaleConfidence==null?50:resale.resaleConfidence,0,100);
  const horizonDays=Math.max(1,Number(options.horizonDays||30));
  const dailyDemand=demandPerDay(resale)||sold30/30;
  const monthlyDemand=dailyDemand*horizonDays;
  const queue=active+1;
  const demandCoverage=queue>0?monthlyDemand/queue:monthlyDemand;
  const velocityProbability=1-Math.exp(-Math.max(0,demandCoverage));
  const confidenceFactor=.45+.55*(confidence/100);
  const sellThroughProbability=clamp(velocityProbability*confidenceFactor,0,.995);
  const confidenceAdjustedDailyDemand=dailyDemand*confidenceFactor;
  const expectedDaysToSell=confidenceAdjustedDailyDemand>0?clamp(queue/confidenceAdjustedDailyDemand,1,365):365;
  const econ=opportunity.economics||{};
  const profit=Number(econ.profit)||0;
  const roi=Number(econ.roi)||0;
  const invested=Math.max(0,Number(econ.totalInvested||econ.totalCost||econ.acquisitionCost||opportunity.currentPrice||opportunity.price)||0);
  const liquidationProfit=Number(opportunity.risk&&opportunity.risk.liquidation&&opportunity.risk.liquidation.economics&&opportunity.risk.liquidation.economics.profit);
  const fallbackProfit=Number.isFinite(liquidationProfit)?liquidationProfit:Math.min(0,profit*.25);
  const expectedProfit=profit*sellThroughProbability+fallbackProfit*(1-sellThroughProbability);
  const expectedRoi=roi*sellThroughProbability+(roi<0?roi:0)*(1-sellThroughProbability);
  const capitalTurnsPerYear=365/expectedDaysToSell;
  const annualizedExpectedProfit=expectedProfit*capitalTurnsPerYear;
  const annualizedExpectedRoi=invested>0?(annualizedExpectedProfit/invested)*100:expectedRoi*capitalTurnsPerYear;
  const capitalVelocityScore=clamp((sellThroughProbability*55)+Math.min(25,capitalTurnsPerYear*5)+Math.min(20,Math.max(0,annualizedExpectedRoi)/10),0,100);
  const status=sellThroughProbability>=.75?'strong':sellThroughProbability>=.5?'moderate':sellThroughProbability>=.3?'thin':'weak';
  return{horizonDays,sold30,active,confidence:+confidence.toFixed(1),dailyDemand:+dailyDemand.toFixed(3),demandCoverage:+demandCoverage.toFixed(3),sellThroughProbability:+sellThroughProbability.toFixed(3),sellThroughPct:+(sellThroughProbability*100).toFixed(1),expectedDaysToSell:+expectedDaysToSell.toFixed(1),capitalTurnsPerYear:+capitalTurnsPerYear.toFixed(2),expectedProfit:money(expectedProfit),expectedRoi:+expectedRoi.toFixed(1),annualizedExpectedProfit:money(annualizedExpectedProfit),annualizedExpectedRoi:+annualizedExpectedRoi.toFixed(1),capitalVelocityScore:+capitalVelocityScore.toFixed(1),fallbackProfit:money(fallbackProfit),status};
}
function fingerprint(opportunity={},options={}){const a=assess(opportunity,options);const p=Math.floor(a.sellThroughPct/10)*10;const ep=Math.floor(a.expectedProfit/25)*25;const days=Math.floor(a.expectedDaysToSell/7)*7;return['sell',a.status,p,ep,days,a.sold30,a.active].join(':');}
return{demandPerDay,assess,fingerprint};
});