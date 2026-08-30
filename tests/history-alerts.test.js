const assert=require('assert');
const E=require('../lib/engine.js');
const H=require('../lib/history.js');
const A=require('../lib/alerts.js');

const rows=[
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:499,observedAt:'2026-08-01T00:00:00Z'},
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:399,observedAt:'2026-08-15T00:00:00Z'},
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:99,observedAt:'2026-08-30T00:00:00Z'},
{retailer:'Home Depot',sku:'ABC',storeId:'200',price:299,observedAt:'2026-08-30T00:00:00Z'}
];
assert.deepStrictEqual(H.priceHistory(rows,{retailer:'Home Depot',sku:'ABC',storeId:'100'}),[499,399,99]);
assert.strictEqual(H.latest(rows,{retailer:'Home Depot',sku:'ABC',storeId:'100'}).price,99);
assert.strictEqual(H.normalizeObservation({retailer:'Home Depot',sku:'ABC',price:'49.97'}).price,49.97);

const opportunity=E.evaluateOpportunity({retailer:'Home Depot',sku:'ABC',storeId:'100',price:99,referencePrice:499,priceHistory:[499,499,479,499,499,499,489,499,499,499,499,499,499,499],comps:{d30:350,d60:340,d90:330,soldCount:35},feeRate:.135,shipping:20,taxRate:.06});
const decision=A.shouldAlert(opportunity);
assert.strictEqual(decision.alert,true);
assert(A.alertFingerprint(opportunity).includes('Home Depot|ABC|100|99'));
const weak={...opportunity,flipScore:20,economics:{...opportunity.economics,profit:10,roi:5},anomaly:{...opportunity.anomaly,confidence:20}};
assert.strictEqual(A.shouldAlert(weak).alert,false);
assert.strictEqual(A.rankAlerts([weak,opportunity]).length,1);
console.log('HUNTIQ history + alert tests passed',{flipScore:opportunity.flipScore,profit:opportunity.economics.profit,roi:opportunity.economics.roi});
