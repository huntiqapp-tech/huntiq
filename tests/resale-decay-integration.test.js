'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-02T12:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:95,sourceConfidence:95});
const out=evaluateOpportunity({
  opportunity:{price:40,purchaseQuantity:4,taxRate:.06,shipping:0,returnRate:.03,returnShipping:8,returnHandlingCost:2,nonRefundableFeeRate:.02},
  comparables:[sold(80,2),sold(82,8),sold(85,20),sold(105,35),sold(110,50),sold(115,65),sold(118,80)],
  channels:[{name:'eBay',feeRate:.135,fixedFee:.4,holdingDays:30}],
  history:{sampleCount:14,spanDays:45,confidence:90},anomaly:{confidence:90,phase:'new-drop'},deal:{fresh:true,verified:true,purchaseQuantity:4},asOf
});
assert(out.resale.trend30vs90Pct<0,'fixture should represent a weakening resale market');
assert(out.partialLiquidation&&out.resaleDecay,'evaluator should attach liquidation and decay assessments');
assert(out.resaleDecay.weightedSalePrice<out.resale.marketValue,'later-unit decay should reduce weighted exit price');
assert(out.economics.decayAdjustedRoi<=out.economics.riskAdjustedRoi,'decay-adjusted ROI should not exceed headline ROI in a falling market');
assert(out.economics.decisionFloorRoi<=out.economics.decayAdjustedRoi,'decision floor should include decay-adjusted economics');
console.log('resale-decay integration tests passed');