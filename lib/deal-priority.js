(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDealPriority=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function annualizedRoi(roiPct,holdingDays){const d=Math.max(1,Number(holdingDays)||1);return +((Number(roiPct)||0)*365/d).toFixed(1);}
function capitalVelocityScore({riskAdjustedRoi=0,riskAdjustedProfit=0,holdingDays=30,confidence=50,anomalyConfidence=50,lifecycleUrgency=50,acquisitionHeadroom=0,buyPrice=0}={}){
  const days=Math.max(1,Number(holdingDays)||1);const roi=Math.max(-100,Number(riskAdjustedRoi)||0);const profit=Number(riskAdjustedProfit)||0;const annualized=annualizedRoi(roi,days);const headroomPct=Number(buyPrice)>0?(Number(acquisitionHeadroom)||0)/Number(buyPrice)*100:0;
  const score=clamp(.28*clamp(annualized/8,0,100)+.22*clamp(roi/1.5,0,100)+.18*clamp(profit/2,0,100)+.12*clamp(confidence,0,100)+.12*clamp(anomalyConfidence,0,100)+.08*clamp(Math.max(0,headroomPct),0,100),0,100);
  return{score:Math.round(score),annualizedRoi:annualized,headroomPct:+headroomPct.toFixed(1),holdingDays:+days.toFixed(1),lifecycleUrgency:clamp(lifecycleUrgency,0,100)};
}
function prioritizeDeal({channel,lifecycle={},baseAlertPriority=0}={}){
  if(!channel)return{priority:0,tier:'skip',reason:'no-resale-channel',capitalVelocity:null};
  const cv=capitalVelocityScore({riskAdjustedRoi:channel.riskAdjustedRoi,riskAdjustedProfit:channel.riskAdjustedProfit,holdingDays:channel.holdingDays,confidence:channel.confidence,anomalyConfidence:lifecycle.adjustedAnomalyConfidence,lifecycleUrgency:lifecycle.alertUrgency,acquisitionHeadroom:channel.acquisitionHeadroom,buyPrice:Math.max(0,(channel.maxBuyPrice||0)-(channel.acquisitionHeadroom||0))});
  const priority=Math.round(clamp(.58*cv.score+.22*clamp(lifecycle.alertUrgency,0,100)+.12*clamp(lifecycle.adjustedAnomalyConfidence,0,100)+.08*clamp(baseAlertPriority,0,100),0,100));
  let tier='watch';if(channel.riskAdjustedProfit<=0||channel.riskAdjustedRoi<=0)tier='skip';else if(priority>=82&&lifecycle.phase!=='established-clearance')tier='immediate';else if(priority>=68)tier='high';else if(priority>=52)tier='standard';else tier='watch';
  const reason=tier==='skip'?'negative-risk-adjusted-economics':tier==='immediate'?'fast-capital-high-anomaly':tier==='high'?'strong-capital-efficiency':tier==='standard'?'profitable-qualified-deal':'monitor-only';
  return{priority,tier,reason,capitalVelocity:cv,suppressPricingErrorLanguage:['persistent-markdown','established-clearance','stable-markdown'].includes(lifecycle.phase)};
}
return{annualizedRoi,capitalVelocityScore,prioritizeDeal};
});