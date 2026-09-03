(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDataState=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const HOUR=36e5;
const clean=value=>value==null?'':String(value).trim().toLowerCase();
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
function partitionCustomerOpportunities(opportunities=[],options={}){
  const out={live:[],cached:[],delayed:[],demo:[],hidden:[]};
  for(const opportunity of opportunities){
    const dataState=classifyOpportunityData(opportunity,options);
    const row={...opportunity,dataState};
    if(!dataState.customerVisible)out.hidden.push(row);else out[dataState.kind].push(row);
  }
  return out;
}
return{classifyOpportunityData,partitionCustomerOpportunities};
});
