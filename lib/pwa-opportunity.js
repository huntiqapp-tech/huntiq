(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('./opportunity-evaluator'):root.HuntIQOpportunityEvaluator,
    typeof module==='object'&&module.exports?require('./history-anomaly'):root.HuntIQHistoryAnomaly
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQPwaOpportunity=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(OpportunityEvaluator,HistoryAnomaly){
'use strict';
const DAY=86400000;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function isoDaysBefore(asOf,days){return new Date(new Date(asOf).getTime()-days*DAY).toISOString();}
function buildDemoCompletedSales(deal={},asOf=new Date().toISOString()){
  const comps=deal.comps||{};
  const bands=[
    {anchor:Number(comps.d30)||0,days:[3,11,23],mult:[.97,1,1.03]},
    {anchor:Number(comps.d60)||0,days:[34,46,57],mult:[.98,1,1.02]},
    {anchor:Number(comps.d90)||0,days:[66,77,88],mult:[.97,1,1.03]}
  ];
  return bands.flatMap((band,bi)=>band.anchor>0?band.days.map((days,i)=>({status:'sold',price:+(band.anchor*band.mult[i]).toFixed(2),shipping:0,soldAt:isoDaysBefore(asOf,days),source:'demo-completed-sale',sourceId:`${deal.id||deal.sku||'demo'}-${bi}-${i}`,matchScore:96,sourceConfidence:94,evidenceClass:'completed_sale'})):[]);
}
function resaleSourceEvidence(comparables=[]){return comparables.map(c=>({evidenceQuality:clamp((c.sourceConfidence==null?50:c.sourceConfidence)/100,0,1),verified:c.verified===true||c.verificationState==='verified',direct:c.direct===true,sourceType:c.sourceType||'marketplace-record',retentionPolicy:c.retentionPolicy,retentionAllowed:c.retentionAllowed,redistributionAllowed:c.redistributionAllowed,ageHours:c.ageHours,identityMatched:c.matchScore==null?undefined:Number(c.matchScore)>=80,conflicted:c.conflicted===true}));}
function evaluateForPwa(deal={},legacy={},opts={}){
  if(!OpportunityEvaluator)throw new Error('HUNTIQ opportunity evaluator unavailable');
  const asOf=opts.asOf||legacy.observedAt||deal.observedAt||new Date().toISOString();
  const hasLiveCompletedSales=Boolean(deal.completedSales&&deal.completedSales.length);const isDemo=!deal.dataOrigin||deal.dataOrigin==='demo'||deal.dataOrigin==='demonstration';const rawComparables=hasLiveCompletedSales?deal.completedSales:(isDemo?buildDemoCompletedSales(deal,asOf):[]);
  const anomaly=legacy.anomaly||{};
  const historyAssessment=HistoryAnomaly?HistoryAnomaly.assessHistory({currentPrice:deal.price,history:deal.priceHistory||[],observations:deal.timeline||[],asOf,evidenceQuality:deal.dataQuality==null?1:deal.dataQuality}):null;
  const history={sampleCount:historyAssessment?historyAssessment.sampleCount:(Array.isArray(deal.priceHistory)?deal.priceHistory.length:0),spanDays:historyAssessment?historyAssessment.spanDays:(Array.isArray(deal.priceHistory)?Math.max(0,(deal.priceHistory.length-1)*7):0),confidence:historyAssessment?historyAssessment.confidence:clamp(anomaly.confidence==null?deal.dataQuality*100:anomaly.confidence,0,100),madPct:historyAssessment&&historyAssessment.madPct,regimeStabilityScore:historyAssessment&&historyAssessment.regimeStabilityScore,regimeShiftPct:historyAssessment&&historyAssessment.regimeShiftPct,recentMedian:historyAssessment&&historyAssessment.recentMedian,volatilityScore:historyAssessment&&historyAssessment.volatilityScore,freshnessScore:historyAssessment&&historyAssessment.freshnessScore,historyCoverageScore:historyAssessment&&historyAssessment.historyCoverageScore,maxGapDays:historyAssessment&&historyAssessment.maxGapDays,medianGapDays:historyAssessment&&historyAssessment.medianGapDays,uniqueObservationCount:historyAssessment&&historyAssessment.uniqueObservationCount};
  const strictAnomalyConfidence=historyAssessment?Math.min(clamp(anomaly.confidence==null?historyAssessment.confidence:anomaly.confidence,0,100),historyAssessment.confidence):clamp(anomaly.confidence||0,0,100);
  const channels=Array.isArray(deal.channels)&&deal.channels.length?deal.channels:[{name:'eBay',feeRate:deal.feeRate,fixedFee:deal.fixedFee||0,shipping:deal.shipping||0,holdingDays:legacy.resale&&legacy.resale.estimatedDaysToSell||21,returnRate:deal.returnRate||.05,returnShipping:deal.returnShipping==null?(deal.shipping||0):deal.returnShipping,returnHandlingCost:deal.returnHandlingCost||2,nonRefundableFeeRate:deal.nonRefundableFeeRate||.03}];
  const sourceEvidence={retailer:Array.isArray(deal.sourceObservations)?deal.sourceObservations:[],resale:Array.isArray(deal.resaleSourceObservations)?deal.resaleSourceObservations:(hasLiveCompletedSales?resaleSourceEvidence(rawComparables):[])};
  const purchaseQuantity=Math.max(1,Math.floor(Number(deal.purchaseQuantity||deal.requiredPurchaseQuantity||1)||1));
  const evaluated=OpportunityEvaluator.evaluateOpportunity({opportunity:{price:deal.price,purchaseQuantity,taxRate:deal.taxRate||0,shipping:deal.shipping||0,miscCost:deal.miscCost||0,holdingCostPerDay:deal.holdingCostPerDay||0,returnRate:deal.returnRate||.05,returnShipping:deal.returnShipping==null?(deal.shipping||0):deal.returnShipping,returnHandlingCost:deal.returnHandlingCost||2,nonRefundableFeeRate:deal.nonRefundableFeeRate||.03},comparables:rawComparables,channels,history,anomaly:{confidence:strictAnomalyConfidence,phase:anomaly.phase||'unknown',madPct:historyAssessment&&historyAssessment.madPct,regimeStabilityScore:historyAssessment&&historyAssessment.regimeStabilityScore},deal:{fresh:historyAssessment?historyAssessment.freshnessScore>=50:true,verified:true,purchaseQuantity},sourceEvidence,asOf});
  return{...evaluated,sourceAdjustedEconomics:evaluated.economics,historyAssessment,comparables:rawComparables,asOf,demoComparables:isDemo&&!hasLiveCompletedSales};
}
return{buildDemoCompletedSales,resaleSourceEvidence,evaluateForPwa};
});
