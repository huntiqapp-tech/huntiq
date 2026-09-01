'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-01T16:00:00.000Z';
const sold=(price,days,extra={})=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:95,sourceConfidence:95,...extra});
const base={
  opportunity:{price:40,taxRate:.06,shipping:8,returnRate:.05,returnShipping:8,returnHandlingCost:2,nonRefundableFeeRate:.03},
  channels:[{name:'eBay',feeRate:.135,fixedFee:.4,holdingDays:21}],
  history:{sampleCount:14,spanDays:45,confidence:90},
  anomaly:{confidence:88,phase:'new-drop'},
  deal:{fresh:true,verified:true},
  asOf
};
{
  const comparables=[sold(120,2),sold(118,5),sold(125,9),sold(122,14),sold(119,20),sold(124,28),sold(115,40),sold(117,55),sold(116,75),{status:'active',price:999,soldAt:new Date(asOf).toISOString()}];
  const out=evaluateOpportunity({...base,comparables});
  assert.equal(out.resale.completedSaleOnly,true);
  assert.equal(out.resale.comparableCount,9,'active asking listing must not enter sold history');
  assert.equal(out.resale.marketValueWindow,30);
  assert(out.economics.riskAdjustedProfit>0);
  assert(out.economics.riskAdjustedRoi>50);
  assert(out.downside.salePrice>0&&out.downside.salePrice<out.resale.marketValue);
  assert.equal(out.evidence.alertEligible,true);
  assert(['strong-buy','buy'].includes(out.recommendation));
}
{
  const comparables=[sold(100,2),sold(100,5),sold(100,10),sold(25,15),sold(20,20),sold(18,25),sold(100,45),sold(95,60)];
  const out=evaluateOpportunity({...base,comparables});
  assert(out.resale.marketValue>0);
  assert(out.downside.salePrice<=out.resale.marketValue);
  assert(out.economics.downsideRoi<0,'weak lower-quartile exit should expose negative downside ROI');
  assert(out.evidence.blockers.includes('negative-downside-roi'));
  assert.equal(out.evidence.alertEligible,false);
  assert.equal(out.recommendation,'skip');
}
console.log('opportunity-evaluator tests passed');