(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQLiveOpportunityReadiness=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
const finite=n=>Number.isFinite(Number(n));
const money=n=>+(Number(n)||0).toFixed(2);

function assessLiveOpportunityReadiness({providerValidation={},historyEvidence={},resaleEvidence={},economics={},decision={}}={}){
  const authenticated=providerValidation.authenticatedLookupPassed===true;
  const sourceChecked=providerValidation.manualSourceCheckPassed===true;
  const displayRights=providerValidation.customerDisplayAllowed===true;
  const redistribution=providerValidation.redistributionAllowed===true;
  const historyPromoted=providerValidation.historyPromoted===true;
  const releaseReady=authenticated&&sourceChecked&&displayRights&&redistribution;

  const historySamples=Math.max(0,Math.floor(Number(historyEvidence.sampleCount)||0));
  const promotedSamples=Math.max(0,Math.floor(Number(historyEvidence.promotedCount)||0));
  const historyReady=historyPromoted&&promotedSamples>=3&&historySamples>=3;
  const resaleSold=Math.max(0,Math.floor(Number(resaleEvidence.soldCount)||0));
  const resaleConfidence=clamp(resaleEvidence.resaleConfidence);
  const resaleReady=resaleSold>=3&&resaleConfidence>=50;

  const profit=finite(economics.expectedProfit)?Number(economics.expectedProfit):0;
  const roi=finite(economics.roi)?Number(economics.roi):0;
  const downsideProfit=finite(economics.downsideProfit)?Number(economics.downsideProfit):profit;
  const downsideRoi=finite(economics.downsideRoi)?Number(economics.downsideRoi):roi;
  const economicsReady=profit>0&&roi>0&&downsideProfit>0&&downsideRoi>0;

  const providerScore=[authenticated,sourceChecked,displayRights,redistribution].filter(Boolean).length/4*100;
  const historyScore=historyReady?100:Math.min(80,promotedSamples*20);
  const resaleScore=resaleReady?Math.min(100,50+resaleConfidence/2):Math.min(49,resaleSold*10);
  const economicsScore=economicsReady?100:0;
  const readinessScore=+(.5*providerScore+.2*historyScore+.2*resaleScore+.1*economicsScore).toFixed(1);

  const anomalyConfidence=historyReady?clamp(historyEvidence.anomalyConfidence):0;
  const conservativeProfit=releaseReady&&historyReady&&resaleReady?money(Math.min(profit,downsideProfit)):0;
  const conservativeRoi=releaseReady&&historyReady&&resaleReady?+Math.min(roi,downsideRoi).toFixed(1):0;
  const alertEligible=releaseReady&&historyReady&&resaleReady&&economicsReady&&decision.alertEligible===true;
  const alertAction=alertEligible?(readinessScore>=90?'instant':'standard'):'suppressed';

  const blockers=[];
  if(!authenticated)blockers.push('provider-auth-validation-required');
  if(!sourceChecked)blockers.push('manual-source-check-required');
  if(!displayRights)blockers.push('customer-display-rights-required');
  if(!redistribution)blockers.push('redistribution-rights-required');
  if(!historyReady)blockers.push('validated-price-history-insufficient');
  if(!resaleReady)blockers.push('resale-evidence-insufficient');
  if(!economicsReady)blockers.push('downside-economics-not-positive');

  return{
    releaseReady,historyReady,resaleReady,economicsReady,readinessScore,
    historyDisposition:historyReady?'validated-history':'shadow-quarantine',
    anomalyConfidence,
    conservativeProfit,conservativeRoi,
    customerDisplayAllowed:releaseReady,
    alertEligible,alertAction,blockers
  };
}
return{assessLiveOpportunityReadiness};
});
