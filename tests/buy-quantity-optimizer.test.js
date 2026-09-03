'use strict';
const assert=require('assert');
const Q=require('../lib/buy-quantity-optimizer');
{
 const r=Q.optimizeBuyQuantity({maxAvailable:6,unitCost:40,unitNetProfit:30,soldCount30:6,soldCount90:18,estimatedDaysToSell:20,resaleConfidence:92,anomalyConfidence:90,evidenceScore:88,maxCapital:500});
 assert.equal(r.recommendedQuantity,6);assert.equal(r.alertEligible,true);assert.equal(r.selected.remainingUnits90,0);
}
{
 const r=Q.optimizeBuyQuantity({maxAvailable:8,unitCost:50,unitNetProfit:35,soldCount30:1,soldCount90:3,estimatedDaysToSell:35,resaleConfidence:90,anomalyConfidence:88,evidenceScore:86,maxCapital:500});
 assert(r.recommendedQuantity<8);assert(r.warnings.includes('do-not-buy-all-available'));assert(r.quantityCurve.some(x=>x.blockers.includes('capital-at-risk-floor-failed')));
}
{
 const r=Q.optimizeBuyQuantity({maxAvailable:5,unitCost:80,unitNetProfit:8,soldCount30:5,soldCount90:15,estimatedDaysToSell:14,resaleConfidence:95,anomalyConfidence:95,evidenceScore:95,minMarginalRoiPct:20});
 assert.equal(r.recommendedQuantity,1);assert(r.quantityCurve[0].blockers.includes('marginal-roi-floor-failed'));assert.equal(r.alertState,'digest');
}
{
 const r=Q.optimizeBuyQuantity({maxAvailable:4,unitCost:100,unitNetProfit:60,soldCount30:4,soldCount90:12,estimatedDaysToSell:20,resaleConfidence:92,anomalyConfidence:91,evidenceScore:90,maxCapital:220});
 assert.equal(r.recommendedQuantity,2);assert(r.quantityCurve[2].blockers.includes('capital-budget-exceeded'));
}
console.log('buy quantity optimizer tests passed');