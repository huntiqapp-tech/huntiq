(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDataState=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const HOUR=36e5;
const clean=value=>value==null?'':String(value).trim().toLowerCase();

// customerAuthorityDisposition() reports whether an opportunity carries an
// evidenceAuthority envelope and, if so, whether every authority flag in it is
// true. It does NOT decide visibility by itself -- see resolveCustomerDataState()
// for the fail-closed policy that consumes this. Kept as its own function so the
// "what does the envelope say" question stays testable in isolation from the
// "is this opportunity allowed to reach the customer" policy.
function customerAuthorityDisposition(opportunity={}){
  if(!Object.prototype.hasOwnProperty.call(opportunity,'evidenceAuthority'))return{present:false,complete:null,missing:[]};
  const authority=opportunity.evidenceAuthority||{};
  const checks=[['historyAuthoritative',authority.historyAuthoritative],['anomalyAuthoritative',authority.anomalyAuthoritative],['marketComparisonAuthoritative',authority.marketComparisonAuthoritative],['profitRoiAuthoritative',authority.profitRoiAuthoritative],['notificationAuthoritative',authority.notificationAuthoritative]];
  const missing=checks.filter(([,value])=>value!==true).map(([name])=>name);
  return{present:true,complete:missing.length===0,missing};
}

// classifyOpportunityData() is a pure data-freshness/validation classifier: live vs
// cached vs delayed vs demo vs validation-only. It intentionally has no knowledge of
// customer evidence-authority -- it is also used internally (e.g. lib/customer-live-payload.js)
// purely to label freshness before evidence authority has even been computed for an
// opportunity. Do not use this function's output alone to decide what a customer may
// see; use resolveCustomerDataState() for that.
function classifyOpportunityData(opportunity={}, {asOf=new Date().toISOString(),maxLiveAgeHours=6,maxCachedAgeHours=48}={}){
  const source=opportunity.source||{};
  const requested=clean(opportunity.dataOrigin||opportunity.dataState||source.dataState||source.kind);
  const validation=clean(opportunity.validationState||source.validationState);
  const observedAt=opportunity.observedAt||opportunity.timestamp||source.observedAt||null;
  const observed=Date.parse(observedAt);const now=Date.parse(asOf);
  const rawAgeHours=Number.isFinite(observed)&&Number.isFinite(now)?(now-observed)/HOUR:null;
  const ageHours=rawAgeHours===null?null:Math.max(0,rawAgeHours);
  if(validation==='shadow'||requested==='shadow'||requested==='shadow-live'){
    return{kind:'validation',label:'VALIDATION ONLY',customerVisible:false,alertEligible:false,ageHours,reason:'provider-shadow-validation'};
  }
  if(requested==='demo'||requested==='demonstration'||!requested){
    return{kind:'demo',label:'DEMO DATA',customerVisible:true,alertEligible:false,ageHours,reason:'demonstration-data'};
  }
  if(rawAgeHours!==null&&rawAgeHours<-(5/60)){
    return{kind:'delayed',label:'DELAYED',customerVisible:true,alertEligible:false,ageHours,reason:'future-observation'};
  }
  if(requested==='live'&&validation==='validated'&&ageHours!==null&&ageHours<=maxLiveAgeHours){
    return{kind:'live',label:'LIVE',customerVisible:true,alertEligible:true,ageHours,reason:null};
  }
  if((requested==='live'||requested==='cached')&&validation==='validated'&&ageHours!==null&&ageHours<=maxCachedAgeHours){
    return{kind:'cached',label:'CACHED',customerVisible:true,alertEligible:false,ageHours,reason:'source-not-live'};
  }
  return{kind:'delayed',label:'DELAYED',customerVisible:true,alertEligible:false,ageHours,reason:validation==='validated'?'stale-source':'source-not-validated'};
}

// resolveCustomerDataState() is the actual customer-facing gate. Every surface that
// decides what a real customer sees or gets alerted on (the PWA's app.js/pwa-runtime.js,
// and the customer live-payload path) must call THIS function, not classifyOpportunityData()
// directly, once evidence-authority is in play.
//
// Fail-closed policy: for any non-demo opportunity, a MISSING evidenceAuthority
// envelope is treated exactly like an INCOMPLETE one -- both withhold the
// opportunity from the customer entirely (not just from alerts). There is no
// "legacy"/compatibility path that lets unauthorized or unaudited evidence through
// just because the authority envelope was never attached. Demo data (dataOrigin
// 'demo'/'demonstration'/absent) is exempt, because it is synthetic and never
// carries real evidence authority in the first place.
function resolveCustomerDataState(opportunity={}, options={}){
  const freshness=classifyOpportunityData(opportunity,options);
  if(freshness.kind==='demo')return freshness;
  if(!freshness.customerVisible)return freshness;
  const authority=customerAuthorityDisposition(opportunity);
  if(authority.complete!==true){
    const reasonTag=authority.present?`customer-authority-incomplete:${authority.missing.join(',')}`:'customer-authority-missing';
    return{kind:'validation',label:'WITHHELD',customerVisible:false,alertEligible:false,ageHours:freshness.ageHours,reason:reasonTag,authority};
  }
  return{...freshness,authority};
}

function partitionCustomerOpportunities(opportunities=[],options={}){
  const out={live:[],cached:[],delayed:[],demo:[],hidden:[]};
  for(const opportunity of opportunities){
    const dataState=resolveCustomerDataState(opportunity,options);
    const row={...opportunity,dataState};
    if(!dataState.customerVisible)out.hidden.push(row);else out[dataState.kind].push(row);
  }
  return out;
}
return{customerAuthorityDisposition,classifyOpportunityData,resolveCustomerDataState,partitionCustomerOpportunities};
});
