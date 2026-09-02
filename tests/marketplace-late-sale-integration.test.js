'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-02T13:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:95,sourceConfidence:95});
const out=evaluateOpportunity({
 opportunity:{price:40,purchaseQuantity:4,taxRate:0,shipping:0},
 comparables:[sold(80,2),sold(82,8),sold(84,20),sold(100,35),sold(104,50),sold(108,65),sold(112,80)],
 channels:[{name:'eBay',feeRate:.13,fixedFee:.4,shipping:8,holdingDays:30,lateSaleStress:{feeRateDriftPer30Days:.005,shippingInflationPctPer30Days:4,holdingCostPerUnitPer30Days:1}}],
 history:{sampleCount:12,spanDays:45,confidence:90},anomaly:{confidence:90,phase:'new-drop'},deal:{fresh:true,verified:true,purchaseQuantity:4},asOf
});
assert(out.marketplaceLateSale,'evaluator should attach marketplace late-sale stress');
assert(Number.isFinite(out.economics.marketplaceLateSaleRoi));
assert(out.economics.decisionFloorRoi<=out.economics.marketplaceLateSaleRoi,'decision floor should include late-sale ROI');
assert(String(out.economics.decisionFloorBasis).includes('marketplace-late-sale'));
console.log('marketplace late-sale integration tests passed');