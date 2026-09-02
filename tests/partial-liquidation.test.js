'use strict';
const assert=require('assert');
const Partial=require('../lib/partial-liquidation');
const Evaluator=require('../lib/opportunity-evaluator');
function sold(price,days){return{status:'sold',price,shipping:0,soldAt:new Date(Date.now()-days*86400000).toISOString(),matchScore:98,sourceConfidence:95,evidenceClass:'completed_sale'};}
{
 const r=Partial.evaluatePartialLiquidation({purchaseQuantity:6,soldCount30:2,soldCount90:6,capitalOutlay:300,expectedNetProfit:180,resaleConfidence:90});
 assert.equal(r.horizons[0].expectedUnitsSold,2);assert.equal(r.horizons[0].remainingUnits,4);assert.equal(r.horizons[0].capitalTiedUp,200);assert.equal(r.horizons[2].remainingUnits,0);assert.equal(r.capitalAtRisk90Pct,0);
}
{
 const r=Partial.evaluatePartialLiquidation({purchaseQuantity:6,soldCount30:1,soldCount90:3,capitalOutlay:300,expectedNetProfit:180,resaleConfidence:90});
 assert.equal(r.horizons[0].remainingUnits,5);assert.equal(r.horizons[2].remainingUnits,3);assert.equal(r.capitalAtRisk90,150);assert(r.warnings.includes('meaningful-90d-capital-lockup'));
}
{
 const r=Partial.evaluatePartialLiquidation({purchaseQuantity:6,soldCount30:0,soldCount90:0,capitalOutlay:300,expectedNetProfit:180,resaleConfidence:90});
 assert(r.blockers.includes('no-90d-partial-liquidation-support'));assert.equal(r.capitalAtRisk90Pct,100);
}
{
 const now=new Date().toISOString();const comps=[sold(100,5),sold(101,35),sold(99,65)];
 const result=Evaluator.evaluateOpportunity({opportunity:{price:40,purchaseQuantity:6},comparables:comps,channels:[{name:'eBay',feeRate:.13,shipping:8,holdingDays:21}],history:{sampleCount:12,spanDays:60,confidence:90,historyCoverageScore:95},anomaly:{confidence:90},deal:{fresh:true,verified:true,purchaseQuantity:6},asOf:now});
 assert(result.partialLiquidation);assert(result.partialLiquidation.horizons[0].remainingUnits>=5);assert(result.economics.capitalAtRisk90>=0);assert.equal(result.evidence.alertLevel,'suppressed');
}
console.log('partial-liquidation tests passed');