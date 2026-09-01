const assert=require('assert');
const V=require('../lib/capital-velocity');
const fast=V.evaluateCapitalVelocity({economics:{riskAdjustedProfit:60,riskAdjustedRoi:60,totalCost:100,holdingDays:10},resale:{estimatedDaysToSell:10,soldCount90:18,activeCount:6}});
const slow=V.evaluateCapitalVelocity({economics:{riskAdjustedProfit:60,riskAdjustedRoi:60,totalCost:100,holdingDays:75},resale:{estimatedDaysToSell:75,soldCount90:4,activeCount:20}});
assert(fast.profitPer30Days>slow.profitPer30Days,'same nominal profit should be worth more when capital turns faster');
assert(fast.roiPer30Days>slow.roiPer30Days,'time-normalized ROI should reward faster exits');
assert(fast.liquidityScore>slow.liquidityScore,'strong sell-through and short holding period should score higher');
assert.equal(fast.liquidityBand,'fast');
assert(['slow','illiquid'].includes(slow.liquidityBand));
assert(slow.alertPenalty>0,'slow resale markets should reduce alert urgency');
const illiquid=V.evaluateCapitalVelocity({economics:{riskAdjustedProfit:150,riskAdjustedRoi:120,totalCost:125},resale:{estimatedDaysToSell:150,soldCount90:1,activeCount:25}});
assert.equal(illiquid.liquidityBand,'illiquid');
assert.equal(illiquid.alertWarning,'illiquid-resale-market');
assert(illiquid.capitalEfficiencyScore<fast.capitalEfficiencyScore,'large nominal ROI should not hide very poor capital velocity');
const comparison=V.compareCapitalVelocity([
  {name:'Fast local',riskAdjustedProfit:42,riskAdjustedRoi:42,totalCost:100,holdingDays:8,soldCount90:15,activeCount:5},
  {name:'Slow marketplace',riskAdjustedProfit:80,riskAdjustedRoi:80,totalCost:100,holdingDays:100,soldCount90:2,activeCount:18}
]);
assert.equal(comparison.best.channel.name,'Fast local','ranking should prefer superior capital efficiency over nominal ROI alone');
console.log('HUNTIQ capital velocity tests passed',comparison.best);