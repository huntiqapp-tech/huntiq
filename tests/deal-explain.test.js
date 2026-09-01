const assert=require('assert');
const Explain=require('../lib/deal-explain');

const buy={economics:{profit:182.4,roi:86.2},resale:{resaleConfidence:78},purchaseDecision:{verdict:'Strong Buy'},quantityEconomics:{plannedUnits:3},readiness:{ready:true,readinessScore:82,reasons:[]}};
assert.equal(Explain.decisionLabel(buy),'STRONG BUY');
const buySummary=Explain.summary(buy);
assert.ok(buySummary.text.includes('$182 est. profit'));
assert.ok(buySummary.text.includes('86% ROI'));
assert.ok(buySummary.text.includes('78% resale confidence'));
assert.ok(buySummary.text.includes('82% readiness'));
assert.ok(buySummary.text.includes('3 units planned'));
assert.equal(buySummary.readiness.message,'Evidence ready');

const gated={economics:{profit:300,roi:150},purchaseDecision:{verdict:'Strong Buy'},quantityEconomics:{plannedUnits:0},quantityDecision:{blocked:true},readiness:{ready:true,readinessScore:90,reasons:[]}};
assert.equal(Explain.decisionLabel(gated),'SKIP','quantity gating must override attractive unit economics after readiness passes');
assert.ok(Explain.summary(gated).text.startsWith('SKIP'));

const thin={economics:{profit:300,roi:150},resale:{resaleConfidence:70},purchaseDecision:{verdict:'Strong Buy'},quantityEconomics:{plannedUnits:2},readiness:{ready:false,readinessScore:39,reasons:['price-history-thin','active-ask-only-comps']}};
assert.equal(Explain.decisionLabel(thin),'WAIT','insufficient evidence must override a raw strong-buy verdict');
const thinSummary=Explain.summary(thin);
assert.ok(thinSummary.text.startsWith('WAIT'));
assert.ok(thinSummary.text.includes('39% readiness'));
assert.equal(thinSummary.readiness.reasons[0],'Needs more local price history');
assert.ok(thinSummary.readiness.reasons.includes('Resale value uses active asks, not verified sales'));

const watch={economics:{profit:22,roi:18},resale:{resaleConfidence:44}};
assert.equal(Explain.decisionLabel(watch),'WATCH');
assert.equal(Explain.readinessState(watch).known,false);
console.log('deal-explain tests passed');