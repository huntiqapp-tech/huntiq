const assert=require('assert');
const Ranking=require('../lib/opportunity-ranking');

const strong={id:'strong',profit:70,roi:55,confidence:88,anomaly:{dropPct:35},resale:{liquidityScore:82,estimatedDaysToSell:12},downsideEconomics:{roi:28},capitalEfficiency:{score:80},executionConfidence:{score:90},evidenceAgreement:{score:92},opportunityHalfLife:{evidenceStrengthRemainingPct:94}};
const flashy={id:'flashy',profit:8,roi:18,confidence:42,anomaly:{dropPct:72},resale:{liquidityScore:25,estimatedDaysToSell:75},downsideEconomics:{roi:-8},capitalEfficiency:{score:22},executionConfidence:{score:38},evidenceAgreement:{score:45},opportunityHalfLife:{evidenceStrengthRemainingPct:70}};
const highRoi={id:'roi',profit:40,roi:120,confidence:70,anomaly:{dropPct:30},resale:{liquidityScore:60,estimatedDaysToSell:30},downsideEconomics:{roi:35},capitalEfficiency:{score:55},executionConfidence:{score:75},evidenceAgreement:{score:80},opportunityHalfLife:{evidenceStrengthRemainingPct:90}};

assert(Ranking.bestOpportunityScore(strong)>Ranking.bestOpportunityScore(flashy),'weak evidence must keep a flashy markdown below a stronger opportunity');
assert.deepStrictEqual(Ranking.rank([flashy,strong,highRoi],'best')[0].id,'strong');
assert.deepStrictEqual(Ranking.rank([flashy,strong,highRoi],'discount')[0].id,'flashy');
assert.deepStrictEqual(Ranking.rank([flashy,strong,highRoi],'roi')[0].id,'roi');
assert.deepStrictEqual(Ranking.rank([flashy,strong,highRoi],'fastest')[0].id,'strong');

const affiliateInflated={...strong,id:'affiliate',affiliateCommission:9999,affiliatePayout:9999};
assert.strictEqual(Ranking.bestOpportunityScore(affiliateInflated),Ranking.bestOpportunityScore(strong),'affiliate economics must not affect deal ranking');

console.log('opportunity-ranking tests passed');
