(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQSourceReliability=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
function normalizeObservation(o={}){
  const evidence=clamp(o.evidenceQuality==null?o.sourceConfidence==null?0:o.sourceConfidence/100:o.evidenceQuality,0,1);
  const verified=o.verified===true||o.verificationState==='verified';
  const direct=o.direct===true||['official-api','authorized-feed','retailer-page'].includes(String(o.sourceType||'').toLowerCase());
  const persistent=o.retentionPolicy==='persistent'||o.retentionAllowed===true;
  const redistributable=o.redistributionAllowed===true;
  const ageHours=Math.max(0,Number(o.ageHours)||0);
  const freshness=clamp(100-ageHours*2.5,0,100);
  let score=evidence*55+(verified?15:0)+(direct?12:0)+(persistent?8:0)+(redistributable?5:0)+freshness*.05;
  if(o.conflicted===true)score-=20;
  if(o.identityMatched===false)score-=30;
  return{score:clamp(score,0,100),evidence,verified,direct,persistent,redistributable,freshness};
}
function assessSourceReliability(observations=[]){
  const rows=(Array.isArray(observations)?observations:[]).map(normalizeObservation);
  if(!rows.length)return{score:50,band:'unknown',count:0,verifiedCount:0,directCount:0,persistentCount:0,redistributableCount:0,conflictCount:0};
  const score=Math.round(mean(rows.map(r=>r.score)));
  const conflictCount=(observations||[]).filter(o=>o&&o.conflicted===true).length;
  return{score,band:score>=85?'high':score>=70?'good':score>=50?'mixed':'weak',count:rows.length,verifiedCount:rows.filter(r=>r.verified).length,directCount:rows.filter(r=>r.direct).length,persistentCount:rows.filter(r=>r.persistent).length,redistributableCount:rows.filter(r=>r.redistributable).length,conflictCount};
}
function capConfidence(confidence,reliability){return Math.round(Math.min(clamp(confidence,0,100),clamp(reliability&&reliability.score==null?50:reliability&&reliability.score,0,100)));}
function stressEconomics(economics={},reliability={}){
  const score=clamp(reliability.score==null?50:reliability.score,0,100);
  const haircut=score>=85?0:score>=70?.04:score>=50?.10:.20;
  const profit=Number(economics.riskAdjustedProfit)||0;const roi=Number(economics.riskAdjustedRoi)||0;
  return{...economics,sourceReliabilityScore:Math.round(score),sourceReliabilityHaircut:+haircut.toFixed(2),sourceAdjustedProfit:+(profit*(1-haircut)).toFixed(2),sourceAdjustedRoi:+(roi*(1-haircut)).toFixed(1)};
}
return{normalizeObservation,assessSourceReliability,capConfidence,stressEconomics};
});