(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQInventoryScarcity=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,Number(v)||0));
const num=v=>Number.isFinite(Number(v))?Number(v):null;
function assessInventoryScarcity(input={}){
  const inventory=input.inventory||{};
  const execution=input.execution||input.executionConfidence||{};
  const lifecycle=input.lifecycle||input.clearanceLifecycle||{};
  const current=num(inventory.currentCount==null?inventory.quantity:inventory.currentCount);
  const previous=num(inventory.previousCount==null?inventory.priorQuantity:inventory.previousCount);
  const ageHours=Math.max(0,num(inventory.ageHours==null?inventory.observationAgeHours:inventory.ageHours)||0);
  const sourceConfidence=num(inventory.sourceConfidence==null?execution.score:inventory.sourceConfidence);
  const ready=Boolean(inventory.readyForPickup||inventory.confirmedAvailable);
  const unavailable=inventory.available===false||(current!=null&&current<=0);
  const clearance=Boolean(lifecycle.retailerClearance||input.clearanceMarked);
  const terminal=String(lifecycle.stage||'')==='terminal-clearance';
  const declinePct=current!=null&&previous!=null&&previous>0?Math.max(0,((previous-current)/previous)*100):null;
  let score=20;
  if(current!=null){if(current<=1)score+=45;else if(current<=3)score+=32;else if(current<=6)score+=18;else score+=5;}
  if(declinePct!=null)score+=Math.min(25,declinePct*.35);
  if(clearance)score+=8;if(terminal)score+=10;if(ready)score+=5;
  const freshnessMultiplier=ageHours<=2?1:ageHours<=8?.9:ageHours<=24?.72:.5;
  const confidenceMultiplier=sourceConfidence==null?.75:clamp(sourceConfidence/100,.35,1);
  score=Math.round(clamp(score*freshnessMultiplier*confidenceMultiplier,0,100));
  const cautions=[];const blockers=[];
  if(ageHours>24)cautions.push('inventory observation is more than 24 hours old');
  if(sourceConfidence!=null&&sourceConfidence<50)cautions.push('inventory source confidence is weak');
  if(unavailable)blockers.push('inventory is currently unavailable');
  let selloutRisk='low';if(score>=75)selloutRisk='critical';else if(score>=58)selloutRisk='high';else if(score>=38)selloutRisk='medium';
  let timing='watch';
  if(unavailable)timing='skip';else if(score>=58&&ready)timing='act-now';else if(score>=58)timing='verify-now';else if(score>=38)timing='watch-closely';
  const waitRiskScore=Math.round(clamp((score+(terminal?12:0)+(clearance?5:0)),0,100));
  let maxWaitHours=null;if(waitRiskScore>=80)maxWaitHours=2;else if(waitRiskScore>=65)maxWaitHours=6;else if(waitRiskScore>=45)maxWaitHours=24;
  let alertPriority='standard';
  if(unavailable)alertPriority='digest';else if(score>=70&&ready&&ageHours<=8&&(sourceConfidence==null||sourceConfidence>=60))alertPriority='instant';else if(score<35)alertPriority='digest';
  return{score,selloutRisk,waitRiskScore,timing,maxWaitHours,currentCount:current,previousCount:previous,declinePct:declinePct==null?null:+declinePct.toFixed(1),observationAgeHours:+ageHours.toFixed(1),sourceConfidence,readyForPickup:ready,available:!unavailable,clearance,terminalClearance:terminal,alertEligible:!unavailable,alertPriority,blockers,cautions,method:'inventory-level-plus-depletion-plus-freshness-plus-source-confidence'};
}
return{assessInventoryScarcity};
});