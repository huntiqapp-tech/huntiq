(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAnomalyLifecycle=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function near(a,b,tolerancePct=1){a=Number(a);b=Number(b);if(!(a>=0)||!(b>=0))return false;const base=Math.max(a,b,1);return Math.abs(a-b)/base*100<=tolerancePct;}
function trailingPersistence(history=[],currentPrice,tolerancePct=1){const values=(history||[]).map(Number).filter(Number.isFinite);let count=1;for(let i=values.length-1;i>=0;i--){if(near(values[i],currentPrice,tolerancePct))count++;else break;}return count;}
function lifecycleScore({currentPrice,history=[],baseline,anomalyConfidence=0,tolerancePct=1}={}){
  currentPrice=Number(currentPrice);baseline=Number(baseline);const persistence=trailingPersistence(history,currentPrice,tolerancePct);const dropPct=baseline>0&&currentPrice>=0?clamp((1-currentPrice/baseline)*100,-100,100):0;
  let phase='normal',errorProbabilityModifier=1,alertUrgency=0;
  if(dropPct>=40&&persistence===1){phase='fresh-drop';errorProbabilityModifier=1.08;alertUrgency=95;}
  else if(dropPct>=40&&persistence<=3){phase='confirming-drop';errorProbabilityModifier=.98;alertUrgency=85;}
  else if(dropPct>=40&&persistence<=6){phase='persistent-markdown';errorProbabilityModifier=.82;alertUrgency=72;}
  else if(dropPct>=40){phase='established-clearance';errorProbabilityModifier=.65;alertUrgency=58;}
  else if(dropPct>=20){phase=persistence>=4?'stable-markdown':'markdown-watch';errorProbabilityModifier=.9;alertUrgency=45;}
  const adjustedAnomalyConfidence=Math.round(clamp(Number(anomalyConfidence)*errorProbabilityModifier,0,99));
  return{phase,persistence,dropPct:+dropPct.toFixed(1),errorProbabilityModifier:+errorProbabilityModifier.toFixed(2),adjustedAnomalyConfidence,alertUrgency};
}
function alertPolicy(lifecycle={},basePriority=0){const phase=String(lifecycle.phase||'normal');const urgency=clamp(lifecycle.alertUrgency,0,100);const adjustedConfidence=clamp(lifecycle.adjustedAnomalyConfidence,0,99);let channel='watch',reason='normal-monitoring';if(phase==='fresh-drop'){channel='immediate';reason='fresh-large-drop';}else if(phase==='confirming-drop'){channel='high';reason='large-drop-confirming';}else if(phase==='persistent-markdown'){channel='standard';reason='persistent-markdown';}else if(phase==='established-clearance'){channel='digest';reason='established-clearance';}else if(phase==='markdown-watch'||phase==='stable-markdown'){channel='watch';reason=phase;}const priority=Math.round(clamp(.55*clamp(basePriority,0,100)+.30*urgency+.15*adjustedConfidence,0,100));return{channel,reason,priority,suppressPricingErrorLanguage:phase==='persistent-markdown'||phase==='established-clearance'||phase==='stable-markdown'};}
return{near,trailingPersistence,lifecycleScore,alertPolicy};
});