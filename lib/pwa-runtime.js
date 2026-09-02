(function(root){
'use strict';
if(!root.HuntIQPwaOpportunity||typeof deals==='undefined'||typeof renderDeals!=='function')return;
for(const d of deals){
  try{
    const strict=root.HuntIQPwaOpportunity.evaluateForPwa(d,d,{asOf:d.observedAt||new Date().toISOString()});
    d.strictEvaluation=strict;
    d.strictVelocity=strict.velocity||null;
    d.retailerSourceReliability=strict.sourceReliability&&strict.sourceReliability.retailer||null;
    d.resaleSourceReliability=strict.sourceReliability&&strict.sourceReliability.resale||null;
    d.combinedSourceReliability=strict.sourceReliability&&strict.sourceReliability.combined||null;
    d.sourceAdjustedProfit=strict.economics&&strict.economics.sourceAdjustedProfit!=null?strict.economics.sourceAdjustedProfit:null;
    d.sourceAdjustedRoi=strict.economics&&strict.economics.sourceAdjustedRoi!=null?strict.economics.sourceAdjustedRoi:null;
    d.decisionFloorProfit=strict.economics&&strict.economics.decisionFloorProfit!=null?strict.economics.decisionFloorProfit:null;
    d.decisionFloorRoi=strict.economics&&strict.economics.decisionFloorRoi!=null?strict.economics.decisionFloorRoi:null;
    d.resalePriceIntegrity=strict.resale&&strict.resale.priceIntegrity!=null?strict.resale.priceIntegrity:null;
    d.resaleOutlierCount=strict.resale&&strict.resale.outlierCount!=null?strict.resale.outlierCount:null;
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
const pct=v=>v==null?'n/a':`${Math.round(Number(v))}%`;const dollars=v=>v==null?'n/a':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v));
function decorateDetails(){document.querySelectorAll('#dealGrid .deal-card').forEach(card=>{const title=card.querySelector('h3')&&card.querySelector('h3').textContent;const retailer=card.querySelector('.retailer')&&card.querySelector('.retailer').textContent;const d=deals.find(x=>x.title===title&&x.retailer===retailer);const panel=card.querySelector('.comp-panel');if(!d||!panel||panel.querySelector('.strict-evidence'))return;const block=document.createElement('div');block.className='strict-evidence';block.innerHTML=`<br><strong>HUNTIQ strict evidence</strong><br>Retailer source reliability: ${pct(d.retailerSourceReliability&&d.retailerSourceReliability.score)} · Resale source reliability: ${pct(d.resaleSourceReliability&&d.resaleSourceReliability.score)} · Combined: ${pct(d.combinedSourceReliability&&d.combinedSourceReliability.score)}<br>Resale integrity: ${pct(d.resalePriceIntegrity)} · filtered outliers: ${d.resaleOutlierCount==null?'n/a':d.resaleOutlierCount} · freshness: ${pct(d.resaleFreshnessScore)} · newest sold comp: ${d.newestCompletedSaleAgeDays==null?'n/a':Math.round(d.newestCompletedSaleAgeDays)+'d'}<br>Source-adjusted profit: ${dollars(d.sourceAdjustedProfit)} · source-adjusted ROI: ${pct(d.sourceAdjustedRoi)} · <strong>decision-floor profit: ${dollars(d.decisionFloorProfit)} · ROI: ${pct(d.decisionFloorRoi)}</strong><br>Alert: ${d.alert&&d.alert.priority||'suppressed'}${d.alert&&d.alert.blockers&&d.alert.blockers.length?` · blockers: ${d.alert.blockers.join(', ')}`:''}${d.alert&&d.alert.warnings&&d.alert.warnings.length?` · warnings: ${d.alert.warnings.join(', ')}`:''}`;panel.appendChild(block);});}
renderDeals();decorateDetails();const grid=document.querySelector('#dealGrid');if(grid&&typeof MutationObserver!=='undefined')new MutationObserver(()=>decorateDetails()).observe(grid,{childList:true,subtree:true});
})(typeof globalThis!=='undefined'?globalThis:this);