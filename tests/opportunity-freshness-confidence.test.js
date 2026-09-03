'use strict';
const assert=require('assert');
const {assessOpportunityHalfLife}=require('../lib/opportunity-half-life');
const {scoreOpportunityConfidence}=require('../lib/opportunity-confidence');
function dealWith(opportunityHalfLife){return{confidence:95,historyAssessment:{historyCoverageScore:92},resale:{resaleConfidence:90,liquidityScore:85,soldCount:30},economics:{roi:80},downsideEconomics:{roi:35},alert:{alert:true},dataOrigin:'live',opportunityHalfLife};}
const fresh=assessOpportunityHalfLife({retailAgeMinutes:15,resaleAgeDays:3,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:70,baseRoiPct:80,anomalyConfidence:95,resaleConfidence:90,evidenceScore:90,dataState:'live'});
const freshConfidence=scoreOpportunityConfidence(dealWith(fresh));
assert.equal(fresh.alertState,'instant');assert.equal(freshConfidence.level,'HIGH');assert.equal(freshConfidence.alertEligible,true);assert(freshConfidence.components.freshnessHalfLife>80);
const aging=assessOpportunityHalfLife({retailAgeMinutes:120,resaleAgeDays:10,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:70,baseRoiPct:80,anomalyConfidence:95,resaleConfidence:90,evidenceScore:90,dataState:'live'});
const agingConfidence=scoreOpportunityConfidence(dealWith(aging));
assert.equal(aging.alertState,'standard');assert.equal(agingConfidence.alertEligible,false);assert(agingConfidence.score<=79);assert(agingConfidence.cautions.includes('retail-signal-decaying'));assert(aging.adjustedProfit<fresh.adjustedProfit);
const stale=assessOpportunityHalfLife({retailAgeMinutes:420,resaleAgeDays:45,retailHalfLifeMinutes:90,resaleHalfLifeDays:30,baseProfit:20,baseRoiPct:35,anomalyConfidence:80,resaleConfidence:80,evidenceScore:70,dataState:'live'});
const staleConfidence=scoreOpportunityConfidence(dealWith(stale));
assert.equal(stale.alertState,'digest');assert.equal(staleConfidence.alertEligible,false);assert(staleConfidence.score<=59);assert(staleConfidence.blockers.some(x=>x.includes('floor-failed')));
console.log('opportunity freshness confidence integration tests passed');
