(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQCapitalVelocity=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function evaluateCapitalVelocity({economics={},resale={}}={}){
  const daysToSell=Math.max(1,Number(resale.estimatedDaysToSell||economics.holdingDays||30)||30);
  const sold90=Math.max(0,Number(resale.soldCount90||resale.soldCount||0));
  const active=Math.max(0,Number(resale.activeCount||resale.listedCount||0));
  const riskAdjustedProfit=Number(economics.riskAdjustedProfit)||0;
  const riskAdjustedRoi=Number(economics.riskAdjustedRoi)||0;
  const totalCost=Math.max(0,Number(economics.totalCost)||0);
  const sellThroughRate=(sold90+active)>0?sold90/(sold90+active):null;
  const turnsPerYear=365/daysToSell;
  const profitPer30Days=riskAdjustedProfit*(30/daysToSell);
  const roiPer30Days=riskAdjustedRoi*(30/daysToSell);
  const timeScore=clamp(100-(daysToSell-7)*1.35,0,100);
  const sellThroughScore=sellThroughRate==null?50:clamp(sellThroughRate*100,0,100);
  const evidenceScore=clamp(Math.min(sold90,20)*5,0,100);
  const liquidityScore=clamp(timeScore*.55+sellThroughScore*.30+evidenceScore*.15,0,100);
  let liquidityBand='normal';
  if(daysToSell<=14&&liquidityScore>=70)liquidityBand='fast';
  else if(daysToSell>90||liquidityScore<30)liquidityBand='illiquid';
  else if(daysToSell>45||liquidityScore<50)liquidityBand='slow';
  const alertPenalty=liquidityBand==='illiquid'?30:liquidityBand==='slow'?12:0;
  const alertWarning=liquidityBand==='illiquid'?'illiquid-resale-market':liquidityBand==='slow'?'slow-resale-velocity':null;
  const capitalEfficiencyScore=clamp(liquidityScore*.45+clamp(roiPer30Days,0,100)*.35+clamp(profitPer30Days/2,0,100)*.20,0,100);
  return{daysToSell:round(daysToSell),soldCount90:sold90,activeCount:active,sellThroughRate:sellThroughRate==null?null:round(sellThroughRate,3),turnsPerYear:round(turnsPerYear,2),profitPer30Days:round(profitPer30Days,2),roiPer30Days:round(roiPer30Days),liquidityScore:Math.round(liquidityScore),liquidityBand,capitalEfficiencyScore:Math.round(capitalEfficiencyScore),alertPenalty,alertWarning,totalCost:round(totalCost,2)};
}
function compareCapitalVelocity(channels=[]){
  const ranked=(channels||[]).map(channel=>({channel,...evaluateCapitalVelocity({economics:channel,resale:channel.resale||{estimatedDaysToSell:channel.holdingDays,soldCount90:channel.soldCount90,activeCount:channel.activeCount}})})).sort((a,b)=>b.capitalEfficiencyScore-a.capitalEfficiencyScore||b.profitPer30Days-a.profitPer30Days||b.roiPer30Days-a.roiPer30Days);
  return{best:ranked[0]||null,channels:ranked};
}
return{evaluateCapitalVelocity,compareCapitalVelocity};
});