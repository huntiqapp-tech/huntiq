(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQObservationIntegrity=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
const norm=v=>String(v??'').trim().toLowerCase();
const identityFields=['retailer','sku','storeId','zip','channel','condition','priceScope','fulfillment'];
function sameIdentity(a={},b={}){return identityFields.every(k=>!norm(a[k])||!norm(b[k])||norm(a[k])===norm(b[k]));}
function identityMismatchCount(a={},b={}){return identityFields.reduce((n,k)=>n+((norm(a[k])&&norm(b[k])&&norm(a[k])!==norm(b[k]))?1:0),0);}
function assessObservationIntegrity({target={},history=[],historyEvidence={},resaleEvidence={},economics={},decision={}}={}){
  const rows=Array.isArray(history)?history:[];
  const exact=rows.filter(r=>sameIdentity(target,r));
  const contaminated=rows.filter(r=>identityMismatchCount(target,r)>0);
  const exactCount=exact.length,totalCount=rows.length;
  const contaminationRatio=totalCount?contaminated.length/totalCount:1;
  const sampleScore=Math.min(100,exactCount/5*100);
  const contaminationScore=100-clamp(contaminationRatio*100);
  const integrityScore=+(sampleScore*.55+contaminationScore*.45).toFixed(1);
  const historyReady=exactCount>=3&&integrityScore>=55;
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
  if(adjustedAnomalyConfidence<50)blockers.push('anomaly-confidence-insufficient');
  if(adjustedResaleConfidence<50)blockers.push('resale-confidence-insufficient');
  if(!economicsReady)blockers.push('confidence-adjusted-economics-not-positive');
  return{identityFields:[...identityFields],exactCount,totalCount,contaminationCount:contaminated.length,contaminationRatio:+contaminationRatio.toFixed(3),integrityScore,historyReady,adjustedAnomalyConfidence,adjustedResaleConfidence,conservativeProfit,conservativeRoi,alertEligible,alertAction,blockers};
}
return{identityFields,sameIdentity,identityMismatchCount,assessObservationIntegrity};
});
