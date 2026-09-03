const assert=require('assert');
const {assessClearanceLifecycle}=require('../lib/clearance-lifecycle');

const fresh=assessClearanceLifecycle({
  persistenceDays:2,confirmations:2,
  history:{historyCoverageScore:85},
  anomaly:{score:88,confidence:84,dropPct:45},
  resale:{expectedPrice:120,sellThroughRate:70},
  economics:{profit:55,roi:85},
  momentum:{resaleTrendPct:2}
});
assert.equal(fresh.stage,'fresh-markdown');
assert.equal(fresh.alertPriority,'instant');
assert.equal(fresh.alertEligible,true);
assert.equal(fresh.adjustedAnomalyConfidence,84);

const established=assessClearanceLifecycle({
  persistenceDays:10,confirmations:5,
  history:{historyCoverageScore:80},
  anomaly:{score:80,confidence:78,dropPct:38},
  resale:{expectedPrice:100,sellThroughRate:60},
  economics:{profit:40,roi:55},
  momentum:{resaleTrendPct:-5}
});
assert.equal(established.stage,'established-markdown');
assert.equal(established.alertPriority,'standard');
assert(established.adjustedAnomalyConfidence<78);

const normalized=assessClearanceLifecycle({
  persistenceDays:30,confirmations:7,
  history:{historyCoverageScore:90},
  anomaly:{score:70,confidence:70,dropPct:50},
  resale:{expectedPrice:90,sellThroughRate:45},
  economics:{profit:30,roi:35},
  momentum:{resaleTrendPct:-12}
});
assert.equal(normalized.stage,'normalized-low-price');
assert.equal(normalized.alertEligible,false);
assert.equal(normalized.alertPriority,'digest');
assert(normalized.blockers.some(v=>v.includes('fresh-anomaly confidence')));

const terminal=assessClearanceLifecycle({
  persistenceDays:25,confirmations:6,retailerClearance:true,terminalClearance:true,
  history:{historyCoverageScore:88},
  anomaly:{score:92,confidence:90,dropPct:65},
  resale:{expectedPrice:150,sellThroughRate:20},
  economics:{profit:70,roi:95},
  momentum:{resaleTrendPct:-18}
});
assert.equal(terminal.stage,'terminal-clearance');
assert(terminal.lifecycleAdjustedResale<150);
assert(terminal.lifecycleAdjustedProfit<70);
assert(terminal.lifecycleAdjustedRoi<95);
assert.equal(terminal.alertEligible,false);
assert(terminal.blockers.some(v=>v.includes('weak resale sell-through')));

console.log('clearance lifecycle tests passed');
