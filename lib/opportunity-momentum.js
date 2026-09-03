(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQOpportunityMomentum=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,Number(v)||0));
const num=v=>Number.isFinite(Number(v))?Number(v):null;
function assessOpportunityMomentum(input={}){
  const anomaly=input.anomaly||{};const resale=input.resale||{};const economics=input.economics||{};const episode=input.priceEpisode||input.executionConfidence||{};
  const confirmations=Math.max(0,Number(episode.confirmationCount||episode.recentConfirmationCount)||0);
  const spanHours=Math.max(0,Number(episode.confirmationSpanHours||episode.spanHours)||0);
  const persistenceDays=spanHours/24;
  const recentMedian=num(resale.recentMedian||resale.median30d||resale.recentSoldMedian);
  const priorMedian=num(resale.priorMedian||resale.median31to90d||resale.priorSoldMedian);
  const resaleTrendPct=recentMedian!=null&&priorMedian!=null&&priorMedian>0?((recentMedian-priorMedian)/priorMedian)*100:null;
  const sustainedFactor=clamp(((persistenceDays-3)/11)*Math.min(1,confirmations/6));
  const trendPenalty=resaleTrendPct==null?0:clamp((-resaleTrendPct)/30);
  const anomalyMultiplier=clamp(1-.35*sustainedFactor,.55,1);
  const economicsMultiplier=clamp(1-.45*trendPenalty-.15*sustainedFactor,.35,1);
  const adjustedAnomalyScore=Math.round((Number(anomaly.score)||0)*anomalyMultiplier);
  const adjustedAnomalyConfidence=Math.round((Number(anomaly.confidence)||0)*anomalyMultiplier);
  const profit=num(economics.profit),roi=num(economics.roi);
  const momentumAdjustedProfit=profit==null?null:+(profit*economicsMultiplier).toFixed(2);
  const momentumAdjustedRoi=roi==null?null:+(roi*economicsMultiplier).toFixed(1);
  const blockers=[];const cautions=[];
  if(persistenceDays>=14&&confirmations>=4)cautions.push('retailer markdown has persisted long enough to resemble a new price regime');
  if(resaleTrendPct!=null&&resaleTrendPct<=-15)cautions.push('recent sold prices are compressing versus the prior resale window');
  if(persistenceDays>=14&&confirmations>=4&&resaleTrendPct!=null&&resaleTrendPct<=-15)blockers.push('persistent markdown and resale compression reduce urgency');
  if(momentumAdjustedRoi!=null&&momentumAdjustedRoi<10)blockers.push('momentum-adjusted ROI is below the safety floor');
  const score=Math.round(100*clamp(.55*(1-sustainedFactor)+.45*(1-trendPenalty)));
  const alertEligible=!blockers.length;
  return{score,persistenceDays:+persistenceDays.toFixed(1),confirmations,resaleTrendPct:resaleTrendPct==null?null:+resaleTrendPct.toFixed(1),anomalyMultiplier:+anomalyMultiplier.toFixed(3),economicsMultiplier:+economicsMultiplier.toFixed(3),adjustedAnomalyScore,adjustedAnomalyConfidence,momentumAdjustedProfit,momentumAdjustedRoi,blockers,cautions,alertEligible,method:'markdown-persistence-plus-resale-compression'};
}
return{assessOpportunityMomentum};
});