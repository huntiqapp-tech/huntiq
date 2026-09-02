(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQEvidenceConcentration=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function tsFor(row){return row&&(row.soldAt||row.observedAt||row.observed_at||row.timestamp||row.createdAt||row.created_at);}
function assessEvidenceConcentration(rows,{asOf}={}){
  const now=asOf?new Date(asOf):new Date();const valid=(Array.isArray(rows)?rows:[]).map(r=>({row:r,date:new Date(tsFor(r))})).filter(x=>Number.isFinite(x.date.getTime())&&x.date<=now);
  if(!valid.length)return{score:0,band:'none',sampleCount:0,uniqueDays:0,maxDaySharePct:0,warnings:['no-valid-timestamps']};
  const days=new Map();for(const x of valid){const key=x.date.toISOString().slice(0,10);days.set(key,(days.get(key)||0)+1);}const counts=[...days.values()];const maxDay=Math.max(...counts);const maxDayShare=maxDay/valid.length;
  const thinDayPenalty=days.size===1?28:days.size===2?14:days.size===3?6:0;const concentrationPenalty=maxDayShare>=.8?30:maxDayShare>=.6?20:maxDayShare>=.45?10:0;const smallSamplePenalty=valid.length<3?18:valid.length<5?8:0;
  const score=Math.round(clamp(100-thinDayPenalty-concentrationPenalty-smallSamplePenalty,0,100));const band=score>=85?'high':score>=70?'good':score>=50?'mixed':'weak';const warnings=[];if(days.size<3)warnings.push('evidence-spans-too-few-days');if(maxDayShare>=.6)warnings.push('evidence-clustered-on-one-day');if(valid.length<5)warnings.push('thin-evidence-sample');
  return{score,band,sampleCount:valid.length,uniqueDays:days.size,maxDaySharePct:+(maxDayShare*100).toFixed(1),warnings};
}
function capConfidence(confidence,assessment){if(!assessment)return clamp(confidence,0,100);return Math.min(clamp(confidence,0,100),clamp(assessment.score,0,100));}
return{assessEvidenceConcentration,capConfidence};
});