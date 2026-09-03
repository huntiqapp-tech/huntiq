(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQOpportunityHalfLife=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const round=(n,d=2)=>+((Number(n)||0).toFixed(d));
const money=n=>round(n,2);
function decay(age,halfLife){age=Math.max(0,Number(age)||0);halfLife=Math.max(.0001,Number(halfLife)||1);return Math.pow(.5,age/halfLife);}
function assessOpportunityHalfLife({retailAgeMinutes=0,resaleAgeDays=0,retailHalfLifeMinutes=90,resaleHalfLifeDays=30,baseProfit=0,baseRoiPct=0,anomalyConfidence=0,resaleConfidence=0,evidenceScore=0,dataState='live',minAdjustedProfit=8,minAdjustedRoiPct=20}={}){
  const blockers=[],warnings=[];const rawRetailAge=Number(retailAgeMinutes);const rawResaleAge=Number(resaleAgeDays);
  if(Number.isFinite(rawRetailAge)&&rawRetailAge<0)blockers.push('future-retail-observation');
  if(Number.isFinite(rawResaleAge)&&rawResaleAge<0)blockers.push('future-resale-evidence');
  const state=String(dataState||'unknown').toLowerCase();
  if(['validation-only','demo','cached','delayed','unknown'].includes(state))blockers.push('non-live-data-state');
  const rAge=Math.max(0,rawRetailAge||0),sAge=Math.max(0,rawResaleAge||0);
  const retailDecay=decay(rAge,retailHalfLifeMinutes),resaleDecay=decay(sAge,resaleHalfLifeDays);
  const evidence=clamp(evidenceScore,0,100)/100;const crossDomain=Math.sqrt(retailDecay*resaleDecay)*(.75+.25*evidence);
  const adjustedAnomalyConfidence=Math.round(clamp(anomalyConfidence,0,100)*Math.sqrt(retailDecay));
  const adjustedResaleConfidence=Math.round(clamp(resaleConfidence,0,100)*Math.sqrt(resaleDecay));
  const adjustedProfit=money((Number(baseProfit)||0)*crossDomain);const adjustedRoiPct=round((Number(baseRoiPct)||0)*crossDomain,1);
  if(rAge>retailHalfLifeMinutes)warnings.push('retail-signal-decaying');
  if(rAge>retailHalfLifeMinutes*2)warnings.push('retail-signal-stale-risk');
  if(sAge>resaleHalfLifeDays)warnings.push('resale-evidence-aging');
  if(adjustedProfit<minAdjustedProfit)blockers.push('half-life-profit-floor-failed');
  if(adjustedRoiPct<minAdjustedRoiPct)blockers.push('half-life-roi-floor-failed');
  let alertState='instant';
  if(blockers.length||rAge>retailHalfLifeMinutes*4)alertState='digest';
  else if(rAge>retailHalfLifeMinutes||sAge>resaleHalfLifeDays||crossDomain<.7)alertState='standard';
  return{dataState:state,retailAgeMinutes:round(rAge,1),resaleAgeDays:round(sAge,2),retailHalfLifeMinutes:round(retailHalfLifeMinutes,1),resaleHalfLifeDays:round(resaleHalfLifeDays,1),retailDecay:round(retailDecay,4),resaleDecay:round(resaleDecay,4),crossDomainMultiplier:round(crossDomain,4),adjustedAnomalyConfidence,adjustedResaleConfidence,adjustedProfit,adjustedRoiPct,alertState,alertEligible:alertState!=='digest',warnings:[...new Set(warnings)],blockers:[...new Set(blockers)]};
}
return{decay,assessOpportunityHalfLife};
});