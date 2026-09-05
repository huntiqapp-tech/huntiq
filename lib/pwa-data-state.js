(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDataState=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const HOUR=36e5;
const clean=value=>value==null?'':String(value).trim().toLowerCase();
function customerAuthorityDisposition(opportunity={}){
  if(!Object.prototype.hasOwnProperty.call(opportunity,'evidenceAuthority'))return{present:false,complete:null,missing:[]};
  const authority=opportunity.evidenceAuthority||{};
  const checks=[['historyAuthoritative',authority.historyAuthoritative],['anomalyAuthoritative',authority.anomalyAuthoritative],['marketComparisonAuthoritative',authority.marketComparisonAuthoritative],['profitRoiAuthoritative',authority.profitRoiAuthoritative],['notificationAuthoritative',authority.notificationAuthoritative]];
  const missing=checks.filter(([,value])=>value!==true).map(([name])=>name);
  return{present:true,complete:missing.length===0,missing};
}
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
  const authority=customerAuthorityDisposition(opportunity);
  const customerLiveRequested=requested==='live'||requested==='cached';
  if(customerLiveRequested&&validation==='validated'&&!authority.present){
    return{kind:'validation',label:'WITHHELD',customerVisible:false,alertEligible:false,ageHours,reason:'customer-authority-missing',authority};
  }
  if(authority.present&&authority.complete!==true){
    return{kind:'validation',label:'WITHHELD',customerVisible:false,alertEligible:false,ageHours,reason:`customer-authority-incomplete:${authority.missing.join(',')}`,authority};
  }
  if(requested==='live'&&validation==='validated'&&ageHours!==null&&ageHours<=maxLiveAgeHours){
    return{kind:'live',label:'LIVE',customerVisible:true,alertEligible:authority.present?authority.complete===true:true,ageHours,reason:null,authority};
  }
  if((requested==='live'||requested==='cached')&&validation==='validated'&&ageHours!==null&&ageHours<=maxCachedAgeHours){
    return{kind:'cached',label:'CACHED',customerVisible:true,alertEligible:false,ageHours,reason:'source-not-live',authority};
  }
  return{kind:'delayed',label:'DELAYED',customerVisible:true,alertEligible:false,ageHours,reason:validation==='validated'?'stale-source':'source-not-validated',authority};
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
return{customerAuthorityDisposition,classifyOpportunityData,partitionCustomerOpportunities};
});
