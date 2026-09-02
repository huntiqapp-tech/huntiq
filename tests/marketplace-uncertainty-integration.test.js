'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-02T17:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:98,sourceConfidence:98});
const strong=[{evidenceQuality:.99,verified:true,direct:true,sourceType:'official-api',retentionPolicy:'persistent',redistributionAllowed:true,ageHours:1,identityMatched:true}];
const out=evaluateOpportunity({
  opportunity:{price:45,taxRate:.06,shipping:6,returnRate:.03,returnShipping:6,returnHandlingCost:2,marketplaceCostUncertainty:{feeRateUncertainty:.03,shippingUncertaintyPct:20,fixedCostBuffer:3}},
  comparables:[sold(130,2),sold(126,5),sold(128,8),sold(122,12),sold(120,17),sold(118,24),sold(116,35),sold(114,50)],
  channels:[{name:'eBay',feeRate:.135,fixedFee:.4,shipping:8,holdingDays:18,lateSaleStress:{feeRateDriftPct90:2,shippingInflationPct90:10}}],
  history:{sampleCount:16,spanDays:60,confidence:94,historyCoverageScore:96},anomaly:{confidence:93,phase:'new-drop'},deal:{fresh:true,verified:true},sourceEvidence:{retailer:strong,resale:strong},asOf
});
assert(out.marketplaceUncertainty,'uncertainty assessment should be returned');
assert(out.marketplaceUncertainty.uncertaintyCost>0,'uncertainty should reserve a positive cost buffer');
assert(out.economics.marketplaceUncertaintyProfit<=out.economics.marketplaceLateSaleProfit,'uncertainty profit must not exceed late-sale profit');
assert(out.economics.marketplaceUncertaintyRoi<=out.economics.marketplaceLateSaleRoi,'uncertainty ROI must not exceed late-sale ROI');
assert.equal(out.economics.decisionFloorRoi,Math.min(...[out.economics.sourceAdjustedRoi,out.economics.sourceAdjustedDownsideRoi,out.economics.sourceAdjustedConfidenceAdjustedRoi,out.economics.decayAdjustedRoi,out.economics.marketplaceLateSaleRoi,out.economics.marketplaceUncertaintyRoi].filter(Number.isFinite)));
assert.equal(out.economics.decisionFloorBasis,'minimum-of-risk-downside-confidence-source-decay-marketplace-late-sale-uncertainty-adjusted');
console.log('marketplace uncertainty integration tests passed');