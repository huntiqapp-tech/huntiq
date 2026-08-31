const assert=require('assert');
const qa=require('../lib/quantity-alerts');
assert.strictEqual(qa.gate({plannedUnits:0,expectedProfit:100,fulfillmentConfidence:90,recommendation:'skip-unavailable'}).blocked,true);
assert.deepStrictEqual(qa.gate({plannedUnits:2,expectedProfit:140,fulfillmentConfidence:90,recommendation:'buy-limited'}).reasons,[]);
assert.strictEqual(qa.gate({plannedUnits:1,expectedProfit:10,fulfillmentConfidence:90,recommendation:'buy-available'}).blocked,true);
console.log('quantity-alert tests passed');