(function(root){
'use strict';
if(!root.HuntIQPwaOpportunity||typeof deals==='undefined'||typeof renderDeals!=='function')return;
for(const d of deals){
  try{
    const strict=root.HuntIQPwaOpportunity.evaluateForPwa(d,d,{asOf:d.observedAt||new Date().toISOString()});
    d.strictEvaluation=strict;
    d.strictVelocity=strict.velocity||null;
    d.resaleFreshnessScore=strict.resale&&strict.resale.resaleFreshnessScore!=null?strict.resale.resaleFreshnessScore:null;
    d.newestCompletedSaleAgeDays=strict.resale&&strict.resale.newestSaleAgeDays!=null?strict.resale.newestSaleAgeDays:null;
    d.medianCompletedSaleAgeDays=strict.resale&&strict.resale.medianSaleAgeDays!=null?strict.resale.medianSaleAgeDays:null;
    if(strict.resale&&strict.resale.marketValue>0)d.market=strict.resale.marketValue;
    if(strict.economics&&strict.economics.riskAdjustedProfit!=null)d.profit=strict.economics.riskAdjustedProfit;
    if(strict.economics&&strict.economics.riskAdjustedRoi!=null)d.roi=strict.economics.riskAdjustedRoi;
    d.strictRecommendation=strict.recommendation;
    d.alert={...(d.alert||{}),alert:strict.evidence.alertEligible,priority:strict.evidence.alertLevel||'suppressed',strict:true,blockers:strict.evidence.blockers||[],warnings:strict.evidence.warnings||[]};
  }catch(err){
    d.strictEvaluationError=String(err&&err.message||err);
  }
}
renderDeals();
})(typeof globalThis!=='undefined'?globalThis:this);