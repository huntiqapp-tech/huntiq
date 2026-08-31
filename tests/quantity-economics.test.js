const assert=require('assert');
const q=require('../lib/quantity-economics');

const unit={totalCost:55,profit:75,roi:136.4};

const capacity=q.demandCapacity({soldCount:60,soldWindowDays:90,targetHoldingDays:30,maxMarketShare:.25});
assert.strictEqual(capacity,5,'capacity should conservatively limit market share');

const limited=q.plan({unitEconomics:unit,quantity:12,fulfillmentConfidence:90,resale:{soldCount:60,soldWindowDays:90,targetHoldingDays:30,maxMarketShare:.25},cashBudget:1000});
assert.strictEqual(limited.plannedUnits,5);
assert.strictEqual(limited.recommendation,'buy-limited');
assert.strictEqual(limited.committedCash,275);
assert.strictEqual(limited.lotProfit,375);
assert.strictEqual(limited.expectedProfit,337.5);

const cash=q.plan({unitEconomics:unit,quantity:10,fulfillmentConfidence:100,resale:{soldCount:300,soldWindowDays:90,targetHoldingDays:30,maxMarketShare:.5},cashBudget:120});
assert.strictEqual(cash.plannedUnits,2,'cash budget should cap units');
assert.strictEqual(cash.committedCash,110);

const unavailable=q.plan({unitEconomics:unit,quantity:0,fulfillmentConfidence:90,resale:{soldCount:60,soldWindowDays:90}});
assert.strictEqual(unavailable.plannedUnits,0);
assert.strictEqual(unavailable.recommendation,'skip-unavailable');

const bad=q.plan({unitEconomics:{totalCost:55,profit:-5,roi:-9},quantity:4,fulfillmentConfidence:100,resale:{soldCount:100,soldWindowDays:90}});
assert.strictEqual(bad.recommendation,'skip-negative-economics');

console.log('quantity-economics tests passed');