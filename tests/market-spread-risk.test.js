'use strict';
const assert=require('assert');
const {assessMarketSpreadRisk}=require('../lib/market-spread-risk');
const {assessHistory}=require('../lib/history-anomaly');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-02T18:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:98,sourceConfidence:98});
{
  const stable=assessMarketSpreadRisk({marketValue:120,resaleDispersion:.08,retailerMadPct:2,retailerRegimeStabilityScore:92,purchaseQuantity:1,resaleConfidence:90});
  const wide=assessMarketSpreadRisk({marketValue:120,resaleDispersion:.55,retailerMadPct:18,retailerRegimeStabilityScore:35,purchaseQuantity:4,resaleConfidence:60});
  assert(stable.score>wide.score);
  assert(wide.haircutPct>stable.haircutPct);
  assert(wide.conservativeSalePrice<stable.conservativeSalePrice);
}
{
  const observations=[120,119,121,120,118,95,92,90].map((price,i)=>({price,observedAt:new Date(new Date(asOf).getTime()-(8-i)*7*86400000).toISOString()}));
  const out=assessHistory({currentPrice:70,observations,asOf,inferredIntervalDays:7});
  assert(out.regimeStabilityScore<70,'recent historical regime shift should reduce stability');
  assert(out.regimeShiftPct>10);
}
{
  const strong=[{evidenceQuality:.99,verified:true,direct:true,sourceType:'official-api',retentionPolicy:'persistent',redistributionAllowed:true,ageHours:1,identityMatched:true}];
  const out=evaluateOpportunity({opportunity:{price:45,purchaseQuantity:3,taxRate:.06,shipping:6,returnRate:.03,returnShipping:6,returnHandlingCost:2},comparables:[sold(145,2),sold(100,5),sold(138,8),sold(92,12),sold(130,17),sold(88,24),sold(124,35),sold(86,50)],channels:[{name:'eBay',feeRate:.135,fixedFee:.4,shipping:8,holdingDays:18}],history:{sampleCount:16,spanDays:60,confidence:92,historyCoverageScore:96,madPct:14,regimeStabilityScore:45},anomaly:{confidence:90,phase:'new-drop',madPct:14,regimeStabilityScore:45},deal:{fresh:true,verified:true,purchaseQuantity:3},sourceEvidence:{retailer:strong,resale:strong},asOf});
  assert(out.marketSpreadRisk,'market spread assessment should be returned');
  assert(Number.isFinite(out.economics.marketSpreadAdjustedRoi));
  assert(out.economics.marketSpreadAdjustedRoi<=out.economics.riskAdjustedRoi);
  assert(out.economics.decisionFloorRoi<=out.economics.marketSpreadAdjustedRoi);
  assert.equal(out.economics.decisionFloorBasis,'minimum-of-risk-downside-confidence-source-decay-marketplace-late-sale-uncertainty-market-spread-adjusted');
}
console.log('market spread risk tests passed');