(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQEvidenceFreshnessRisk=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function tier(value,bands){for(const [max,score] of bands){if(value<=max)return score;}return bands[bands.length-1][1];}
function assessEvidenceFreshnessRisk(input={}){
  const acquisitionAgeMinutes=Math.max(0,Number(input.acquisitionAgeMinutes)||0);
  const historyNewestAgeDays=Math.max(0,Number(input.historyNewestAgeDays)||0);
  const historyMedianAgeDays=Math.max(0,Number(input.historyMedianAgeDays??historyNewestAgeDays)||0);
  const resaleNewestAgeDays=Math.max(0,Number(input.resaleNewestAgeDays)||0);
  const resaleMedianAgeDays=Math.max(0,Number(input.resaleMedianAgeDays??resaleNewestAgeDays)||0);
  const anomaly=clamp(input.anomalyConfidence??50);
  const resale=clamp(input.resaleConfidence??50);
  const projectedResale=Number(input.projectedResale)||0;
  const acquisitionCost=Math.max(0,Number(input.acquisitionCost)||0);
  const sellingCosts=Math.max(0,Number(input.sellingCosts)||0);
  const acquisitionFreshness=tier(acquisitionAgeMinutes,[[30,100],[120,90],[360,75],[1440,50],[4320,35],[Infinity,15]]);
  const historyNewest=tier(historyNewestAgeDays,[[7,100],[30,85],[90,65],[180,45],[365,30],[Infinity,15]]);
  const historyMedian=tier(historyMedianAgeDays,[[30,100],[90,85],[180,65],[365,45],[730,30],[Infinity,15]]);
  const resaleNewest=tier(resaleNewestAgeDays,[[3,100],[14,90],[30,75],[60,55],[120,35],[Infinity,20]]);
  const resaleMedian=tier(resaleMedianAgeDays,[[14,100],[30,90],[60,75],[90,60],[180,40],[Infinity,20]]);
  const priceHistoryFreshness=clamp(historyNewest*.65+historyMedian*.35);
  const resaleFreshness=clamp(resaleNewest*.65+resaleMedian*.35);
  const overallFreshness=clamp(acquisitionFreshness*.35+priceHistoryFreshness*.30+resaleFreshness*.35);
  const adjustedAnomalyConfidence=clamp(anomaly*(.55+.45*(priceHistoryFreshness/100))*(.75+.25*(acquisitionFreshness/100)));
  const adjustedResaleConfidence=clamp(resale*(.55+.45*(resaleFreshness/100)));
  const resaleHaircut=clamp((100-resaleFreshness)*.0025,0,.25);
  const freshnessAdjustedResale=projectedResale*(1-resaleHaircut);
  const freshnessAdjustedProfit=freshnessAdjustedResale-acquisitionCost-sellingCosts;
  const freshnessAdjustedRoi=acquisitionCost>0?(freshnessAdjustedProfit/acquisitionCost)*100:0;
  const blocked=acquisitionFreshness<40||priceHistoryFreshness<30||resaleFreshness<35||freshnessAdjustedProfit<=0||freshnessAdjustedRoi<=0;
  let alertAction='digest';
  if(!blocked&&overallFreshness>=82&&adjustedAnomalyConfidence>=70&&adjustedResaleConfidence>=70&&freshnessAdjustedProfit>=25&&freshnessAdjustedRoi>=25)alertAction='instant';
  else if(!blocked&&overallFreshness>=60&&adjustedAnomalyConfidence>=50&&adjustedResaleConfidence>=50)alertAction='standard';
  const reasons=[];
  if(acquisitionFreshness<60)reasons.push('stale-acquisition-observation');
  if(priceHistoryFreshness<60)reasons.push('stale-price-history');
  if(resaleFreshness<60)reasons.push('stale-resale-comps');
  if(freshnessAdjustedProfit<=0||freshnessAdjustedRoi<=0)reasons.push('negative-freshness-adjusted-economics');
  return {acquisitionFreshness:Math.round(acquisitionFreshness),priceHistoryFreshness:Math.round(priceHistoryFreshness),resaleFreshness:Math.round(resaleFreshness),overallFreshness:Math.round(overallFreshness),adjustedAnomalyConfidence:Math.round(adjustedAnomalyConfidence),adjustedResaleConfidence:Math.round(adjustedResaleConfidence),resaleHaircutPct:round(resaleHaircut*100),freshnessAdjustedResale:round(freshnessAdjustedResale,2),freshnessAdjustedProfit:round(freshnessAdjustedProfit,2),freshnessAdjustedRoi:round(freshnessAdjustedRoi),blocked,alertAction,reasons};
}
return {assessEvidenceFreshnessRisk};
});