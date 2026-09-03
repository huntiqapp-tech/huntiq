const assert=require('assert');
const {assessOpportunityMomentum}=require('../lib/opportunity-momentum');

const fresh=assessOpportunityMomentum({
  anomaly:{score:84,confidence:82},
  resale:{recentMedian:150,priorMedian:152},
  economics:{profit:60,roi:75},
  priceEpisode:{confirmationCount:2,confirmationSpanHours:18}
});
assert.equal(fresh.alertEligible,true);
assert.ok(fresh.adjustedAnomalyScore>=75);
assert.ok(fresh.momentumAdjustedRoi>=65);

const mature=assessOpportunityMomentum({
  anomaly:{score:88,confidence:86},
  resale:{recentMedian:118,priorMedian:150},
  economics:{profit:48,roi:55},
  priceEpisode:{confirmationCount:7,confirmationSpanHours:24*18}
});
assert.equal(mature.alertEligible,false);
assert.ok(mature.resaleTrendPct<=-20);
assert.ok(mature.adjustedAnomalyScore<88);
assert.ok(mature.momentumAdjustedRoi<55);
assert.ok(mature.blockers.some(x=>x.includes('persistent markdown')));

const noResaleTrend=assessOpportunityMomentum({
  anomaly:{score:70,confidence:68},
  resale:{},
  economics:{profit:30,roi:40},
  priceEpisode:{confirmationCount:5,confirmationSpanHours:24*10}
});
assert.equal(noResaleTrend.resaleTrendPct,null);
assert.equal(noResaleTrend.alertEligible,true);

console.log('opportunity-momentum tests passed');