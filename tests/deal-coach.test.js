'use strict';
const assert=require('assert');
const {buildDealCoach}=require('../lib/deal-coach');

const buy=buildDealCoach({price:100,dataOrigin:'live',anomaly:{dropPct:72,confidence:82},confidence:82,historyAssessment:{historyCoverageScore:88},resale:{soldCount:24,resaleConfidence:79,liquidityScore:71},economics:{profit:145,roi:118},downsideEconomics:{roi:48},riskAdjustedEconomics:{profit:102},purchaseDecision:{maxBuyPrice:155,verdict:'BUY'},alert:{alert:true,priority:'instant'},opportunityMomentum:{score:84,persistenceDays:2.5,resaleTrendPct:3,momentumAdjustedProfit:138,momentumAdjustedRoi:112,alertEligible:true,blockers:[]}});
assert.equal(buy.verdict,'BUY');
assert(buy.reasons.some(x=>x.includes('historical baseline')));
assert(buy.reasons.some(x=>x.includes('24 recent sold')));
assert(buy.reasons.some(x=>x.includes('Opportunity momentum is healthy')));
assert(buy.reasons.some(x=>x.includes('safe max-buy')));
assert(buy.reasons.some(x=>x.includes('alert gate')));
assert.equal(buy.metrics.momentumScore,84);
assert.equal(buy.generatedFrom,'deterministic-evaluator-evidence');

const thin=buildDealCoach({price:200,dataOrigin:'live',anomaly:{dropPct:18,confidence:41},historyAssessment:{historyCoverageScore:38},resale:{soldCount:3,resaleConfidence:32,liquidityScore:24},economics:{profit:15,roi:7},downsideEconomics:{roi:-4},riskAdjustedEconomics:{profit:4},purchaseDecision:{maxBuyPrice:165,verdict:'PASS'},alert:{alert:false,priority:'digest'}});
assert.equal(thin.verdict,'SKIP');
assert(thin.cautions.some(x=>x.includes('Anomaly confidence')));
assert(thin.cautions.some(x=>x.includes('Price-history coverage')));
assert(thin.cautions.some(x=>x.includes('Liquidity is weak')));
assert(thin.cautions.some(x=>x.includes('above the safe max-buy')));

const persistent=buildDealCoach({price:80,dataOrigin:'live',anomaly:{dropPct:55,confidence:86},confidence:86,historyAssessment:{historyCoverageScore:90},resale:{soldCount:30,resaleConfidence:82,liquidityScore:70},economics:{profit:90,roi:75},downsideEconomics:{roi:28},riskAdjustedEconomics:{profit:70},purchaseDecision:{maxBuyPrice:110,verdict:'BUY'},alert:{alert:false,priority:'digest'},opportunityMomentum:{score:34,persistenceDays:18.2,resaleTrendPct:-21,momentumAdjustedProfit:44,momentumAdjustedRoi:36,alertEligible:false,blockers:['persistent markdown and resale compression reduce urgency']}});
assert.equal(persistent.verdict,'WATCH');
assert(persistent.cautions.some(x=>x.includes('18 days')));
assert(persistent.cautions.some(x=>x.includes('21% below')));
assert(persistent.cautions.some(x=>x.includes('$44 profit')));
assert(persistent.cautions.some(x=>x.includes('persistent markdown and resale compression')));
assert.equal(persistent.metrics.momentumAdjustedRoi,36);

const demo=buildDealCoach({price:99,dataOrigin:'demo',anomaly:{dropPct:75,confidence:90},historyAssessment:{historyCoverageScore:95},resale:{soldCount:50,resaleConfidence:90,liquidityScore:90},economics:{profit:300,roi:200},downsideEconomics:{roi:90},purchaseDecision:{maxBuyPrice:180,verdict:'BUY'},alert:{alert:true,priority:'instant'},opportunityMomentum:{score:99,alertEligible:true}});
assert.equal(demo.verdict,'WATCH');
assert(demo.cautions[0].includes('demonstration data'));

console.log('deal-coach tests passed');