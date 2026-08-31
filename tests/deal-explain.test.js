const assert=require('assert');
const Explain=require('../lib/deal-explain');

const buy={economics:{profit:182.4,roi:86.2},resale:{resaleConfidence:78},purchaseDecision:{verdict:'Strong Buy'},quantityEconomics:{plannedUnits:3}};
assert.equal(Explain.decisionLabel(buy),'STRONG BUY');
const buySummary=Explain.summary(buy);
assert.ok(buySummary.text.includes('$182 est. profit'));
assert.ok(buySummary.text.includes('86% ROI'));
assert.ok(buySummary.text.includes('78% resale confidence'));
assert.ok(buySummary.text.includes('3 units planned'));

const gated={economics:{profit:300,roi:150},purchaseDecision:{verdict:'Strong Buy'},quantityEconomics:{plannedUnits:0},quantityDecision:{blocked:true}};
assert.equal(Explain.decisionLabel(gated),'SKIP','quantity gating must override attractive unit economics');
assert.ok(Explain.summary(gated).text.startsWith('SKIP'));

const watch={economics:{profit:22,roi:18},resale:{resaleConfidence:44}};
assert.equal(Explain.decisionLabel(watch),'WATCH');
console.log('deal-explain tests passed');
