'use strict';
const assert=require('assert');
const H=require('../lib/opportunity-half-life');
{
 const r=H.assessOpportunityHalfLife({retailAgeMinutes:15,resaleAgeDays:4,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:42,baseRoiPct:70,anomalyConfidence:92,resaleConfidence:90,evidenceScore:88,dataState:'live'});
 assert.equal(r.alertState,'instant');assert.equal(r.alertEligible,true);assert(r.adjustedProfit>30);assert(r.adjustedAnomalyConfidence>80);
}
{
 const r=H.assessOpportunityHalfLife({retailAgeMinutes:150,resaleAgeDays:10,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:42,baseRoiPct:70,anomalyConfidence:92,resaleConfidence:90,evidenceScore:88,dataState:'live'});
 assert.equal(r.alertState,'standard');assert(r.warnings.includes('retail-signal-decaying'));assert(r.adjustedProfit<42);
}
{
 const r=H.assessOpportunityHalfLife({retailAgeMinutes:420,resaleAgeDays:45,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:20,baseRoiPct:35,anomalyConfidence:80,resaleConfidence:80,evidenceScore:70,dataState:'live'});
 assert.equal(r.alertState,'digest');assert.equal(r.alertEligible,false);assert(r.blockers.some(x=>x.includes('floor-failed')));
}
{
 const r=H.assessOpportunityHalfLife({retailAgeMinutes:5,resaleAgeDays:2,baseProfit:100,baseRoiPct:200,anomalyConfidence:99,resaleConfidence:99,evidenceScore:99,dataState:'validation-only'});
 assert.equal(r.alertEligible,false);assert(r.blockers.includes('non-live-data-state'));
}
{
 const r=H.assessOpportunityHalfLife({retailAgeMinutes:-5,resaleAgeDays:-1,baseProfit:50,baseRoiPct:80,dataState:'live'});
 assert(r.blockers.includes('future-retail-observation'));assert(r.blockers.includes('future-resale-evidence'));assert.equal(r.alertState,'digest');
}
console.log('opportunity half-life tests passed');