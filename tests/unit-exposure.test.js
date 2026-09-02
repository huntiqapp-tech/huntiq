'use strict';
const assert=require('assert');
const UnitExposure=require('../lib/unit-exposure');
const Evaluator=require('../lib/opportunity-evaluator');
function sold(price,days){return{status:'sold',price,shipping:0,soldAt:new Date(Date.now()-days*86400000).toISOString(),matchScore:98,sourceConfidence:95,evidenceClass:'completed_sale'};}
{
 const r=UnitExposure.evaluateUnitExposure({purchaseQuantity:1,soldCount30:2,soldCount90:6,estimatedDaysToSell:21,resaleConfidence:90});
 assert.equal(r.exposureBand,'single-unit');assert.equal(r.blockers.length,0);
}
{
 const r=UnitExposure.evaluateUnitExposure({purchaseQuantity:6,soldCount30:1,soldCount90:3,estimatedDaysToSell:21,resaleConfidence:90});
 assert(r.estimatedLiquidationDays>=180);assert(r.blockers.includes('multi-unit-resale-capacity-insufficient'));
}
{
 const r=UnitExposure.evaluateUnitExposure({purchaseQuantity:4,soldCount30:8,soldCount90:20,estimatedDaysToSell:21,resaleConfidence:90});
 assert(!r.blockers.length);assert(['supported','elevated'].includes(r.exposureBand));
}
{
 const now=new Date().toISOString();const comps=[sold(100,3),sold(102,38),sold(98,46),sold(101,55),sold(99,70),sold(103,85)];
 const base={opportunity:{price:40,purchaseQuantity:6},comparables:comps,channels:[{name:'eBay',feeRate:.13,shipping:8,holdingDays:21}],history:{sampleCount:12,spanDays:60,confidence:90,historyCoverageScore:95},anomaly:{confidence:90},deal:{fresh:true,verified:true,purchaseQuantity:6},asOf:now};
 const result=Evaluator.evaluateOpportunity(base);
 assert.equal(result.unitExposure.purchaseQuantity,6);assert(result.unitExposure.estimatedLiquidationDays>=180);assert(result.evidence.blockers.some(x=>x.indexOf('multi-unit-resale')===0));assert.equal(result.evidence.alertLevel,'suppressed');
}
console.log('unit-exposure tests passed');