'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const {evaluateEvidence}=require('../lib/evidence-gate');
const asOf='2026-09-02T06:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:98,sourceConfidence:98});
const strong=[{evidenceQuality:.99,verified:true,direct:true,sourceType:'official-api',retentionPolicy:'persistent',redistributionAllowed:true,ageHours:1,identityMatched:true}];
{
  const out=evaluateOpportunity({opportunity:{price:45,taxRate:.06,shipping:6,returnRate:.03,returnShipping:6,returnHandlingCost:2},comparables:[sold(130,2),sold(126,5),sold(128,8),sold(122,12),sold(120,17),sold(118,24),sold(116,35),sold(114,50)],channels:[{name:'eBay',feeRate:.135,fixedFee:.4,holdingDays:18}],history:{sampleCount:16,spanDays:60,confidence:94,historyCoverageScore:96},anomaly:{confidence:93,phase:'new-drop'},deal:{fresh:true,verified:true},sourceEvidence:{retailer:strong,resale:strong},asOf});
  const e=out.economics;
  const expected=Math.min(...[e.sourceAdjustedRoi,e.sourceAdjustedDownsideRoi,e.sourceAdjustedConfidenceAdjustedRoi,e.decayAdjustedRoi,e.marketplaceLateSaleRoi,e.marketplaceUncertaintyRoi].filter(Number.isFinite));
  assert.equal(e.decisionFloorRoi,expected);
  assert(e.decisionFloorProfit<=e.sourceAdjustedProfit);
  assert(Number.isFinite(e.marketplaceLateSaleRoi),'late-sale marketplace ROI should be present in evaluator economics');
  assert(Number.isFinite(e.marketplaceUncertaintyRoi),'marketplace uncertainty ROI should be present in evaluator economics');
  assert.equal(e.decisionFloorBasis,'minimum-of-risk-downside-confidence-source-decay-marketplace-late-sale-uncertainty-adjusted');
  assert.equal(out.evidence.components.decisionFloorRoi,e.decisionFloorRoi);
}
{
  const out=evaluateEvidence({history:{sampleCount:12,spanDays:45,confidence:90,historyCoverageScore:95},anomaly:{confidence:90},resale:{confidence:90,resaleFreshnessScore:95,soldCount90:12,priceIntegrity:100},economics:{riskAdjustedProfit:100,riskAdjustedRoi:80,downsideRoi:40,confidenceAdjustedRoi:35,decisionFloorProfit:-3,decisionFloorRoi:-2},deal:{fresh:true,verified:true}});
  assert(out.blockers.includes('negative-decision-floor-economics'));
  assert.equal(out.alertEligible,false,'headline ROI must not override a losing credible floor scenario');
}
console.log('decision-floor tests passed');