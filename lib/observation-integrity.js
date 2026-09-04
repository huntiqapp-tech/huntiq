(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQObservationIntegrity=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const IDENTITY_FIELDS=['retailer','sku','storeId','zip','channel','condition','priceScope','fulfillment'];
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
const norm=v=>String(v??'').trim().toLowerCase();

function classifyIdentity(target={},row={}){
  let missing=0,mismatches=0;
  for(const field of IDENTITY_FIELDS){
    const left=norm(target[field]),right=norm(row[field]);
    if(!left||!right){missing+=1;continue;}
    if(left!==right)mismatches+=1;
  }
  if(mismatches>0)return{status:'mismatch',missing,mismatches};
  if(missing>0)return{status:'ambiguous',missing,mismatches:0};
  return{status:'exact',missing:0,mismatches:0};
}

function sameIdentity(target={},row={}){return classifyIdentity(target,row).status==='exact';}

function assessObservationIntegrity({target={},history=[],historyEvidence={},resaleEvidence={},economics={},decision={}}={}){
  const rows=Array.isArray(history)?history:[];
  const classified=rows.map(row=>classifyIdentity(target,row));
  const exactCount=classified.filter(x=>x.status==='exact').length;
  const contaminationCount=classified.filter(x=>x.status==='mismatch').length;
  const ambiguousCount=classified.filter(x=>x.status==='ambiguous').length;
  const totalCount=rows.length;
  const contaminationRatio=totalCount?contaminationCount/totalCount:1;
  const ambiguityRatio=totalCount?ambiguousCount/totalCount:1;

  const sampleScore=clamp((exactCount/5)*100);
  const identityPurity=clamp(100-(contaminationRatio*100)-(ambiguityRatio*55));
  const integrityScore=+(sampleScore*.6+identityPurity*.4).toFixed(1);
  const historyReady=exactCount>=3&&integrityScore>=60&&contaminationRatio<=.4&&ambiguityRatio<=.4;

  const baseAnomaly=clamp(historyEvidence.anomalyConfidence);
  const adjustedAnomalyConfidence=historyReady?+(baseAnomaly*(integrityScore/100)).toFixed(1):0;
  const resaleConfidence=clamp(resaleEvidence.resaleConfidence);
  const resaleMatchConfidence=clamp(resaleEvidence.matchConfidence==null?resaleConfidence:resaleEvidence.matchConfidence);
  const adjustedResaleConfidence=+(Math.min(resaleConfidence,resaleMatchConfidence)*(integrityScore/100)).toFixed(1);

  const expectedProfit=Number(economics.expectedProfit)||0;
  const roi=Number(economics.roi)||0;
  const confidenceFactor=Math.min(adjustedAnomalyConfidence,adjustedResaleConfidence)/100;
  const conservativeProfit=historyReady?money(expectedProfit*confidenceFactor):0;
  const conservativeRoi=historyReady?+(roi*confidenceFactor).toFixed(1):0;
  const economicsReady=expectedProfit>0&&roi>0&&conservativeProfit>0&&conservativeRoi>0;

  const alertEligible=historyReady&&economicsReady&&adjustedAnomalyConfidence>=50&&adjustedResaleConfidence>=50&&decision.alertEligible===true;
  const alertAction=!alertEligible?'suppressed':(integrityScore>=85&&adjustedAnomalyConfidence>=70&&adjustedResaleConfidence>=70?'instant':'standard');
  const blockers=[];
  if(exactCount<3)blockers.push('comparable-history-insufficient');
  if(contaminationRatio>.4)blockers.push('history-identity-contamination');
  if(ambiguityRatio>.4)blockers.push('history-identity-incomplete');
  if(adjustedAnomalyConfidence<50)blockers.push('anomaly-confidence-insufficient');
  if(adjustedResaleConfidence<50)blockers.push('resale-confidence-insufficient');
  if(!economicsReady)blockers.push('confidence-adjusted-economics-not-positive');

  return{
    identityFields:[...IDENTITY_FIELDS],exactCount,totalCount,contaminationCount,ambiguousCount,
    contaminationRatio:+contaminationRatio.toFixed(3),ambiguityRatio:+ambiguityRatio.toFixed(3),
    integrityScore,historyReady,adjustedAnomalyConfidence,adjustedResaleConfidence,
    conservativeProfit,conservativeRoi,alertEligible,alertAction,blockers
  };
}

return{IDENTITY_FIELDS,classifyIdentity,sameIdentity,assessObservationIntegrity};
});