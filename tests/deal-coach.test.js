'use strict';
const assert=require('assert');
const {buildDealCoach}=require('../lib/deal-coach');

const buy=buildDealCoach({price:100,dataOrigin:'live',anomaly:{dropPct:72,confidence:82},confidence:82,historyAssessment:{historyCoverageScore:88},resale:{soldCount:24,resaleConfidence:79,liquidityScore:71},economics:{profit:145,roi:118},downsideEconomics:{roi:48},riskAdjustedEconomics:{profit:102},purchaseDecision:{maxBuyPrice:155,verdict:'BUY'},alert:{alert:true,priority:'instant'}});
assert.equal(buy.verdict,'BUY');
assert(buy.reasons.some(x=>x.includes('historical baseline')));
assert(buy.reasons.some(x=>x.includes('24 recent sold')));
assert(buy.reasons.some(x=>x.includes('safe max-buy')));
assert(buy.reasons.some(x=>x.includes('alert gate')));
assert.equal(buy.generatedFrom,'deterministic-evaluator-evidence');

const thin=buildDealCoach({price:200,dataOrigin:'live',anomaly:{dropPct:18,confidence:41},historyAssessment:{historyCoverageScore:38},resale:{soldCount:3,resaleConfidence:32,liquidityScore:24},economics:{profit:15,roi:7},downsideEconomics:{roi:-4},riskAdjustedEconomics:{profit:4},purchaseDecision:{maxBuyPrice:165,verdict:'PASS'},alert:{alert:false,priority:'digest'}});
assert.equal(thin.verdict,'SKIP');
assert(thin.cautions.some(x=>x.includes('Anomaly confidence')));
assert(thin.cautions.some(x=>x.includes('Price-history coverage')));
assert(thin.cautions.some(x=>x.includes('Liquidity is weak')));
assert(thin.cautions.some(x=>x.includes('above the safe max-buy')));

const demo=buildDealCoach({price:99,dataOrigin:'demo',anomaly:{dropPct:75,confidence:90},historyAssessment:{historyCoverageScore:95},resale:{soldCount:50,resaleConfidence:90,liquidityScore:90},economics:{profit:300,roi:200},downsideEconomics:{roi:90},purchaseDecision:{maxBuyPrice:180,verdict:'BUY'},alert:{alert:true,priority:'instant'}});
assert.equal(demo.verdict,'WATCH');
assert(demo.cautions[0].includes('demonstration data'));

console.log('deal-coach tests passed');