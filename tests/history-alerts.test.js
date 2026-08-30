const assert=require('assert');
const E=require('../lib/engine.js');
const H=require('../lib/history.js');
const A=require('../lib/alerts.js');

const rows=[
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:499,observedAt:'2026-08-01T00:00:00Z'},
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:399,observedAt:'2026-08-15T00:00:00Z'},
{retailer:'Home Depot',sku:'ABC',storeId:'100',price:99,observedAt:'2026-08-30T00:00:00Z',source:'retailer-page',verified:true},
{retailer:'Home Depot',sku:'ABC',storeId:'200',price:299,observedAt:'2026-08-30T00:00:00Z'}
];
assert.deepStrictEqual(H.priceHistory(rows,{retailer:'Home Depot',sku:'ABC',storeId:'100'}),[499,399,99]);
assert.strictEqual(H.latest(rows,{retailer:'Home Depot',sku:'ABC',storeId:'100'}).price,99);
const normalized=H.normalizeObservation({retailer:'Home Depot',sku:'ABC',price:'49.97',source:'retailer-page',verified:true,evidenceQuality:.9,sourceUrl:'https://example.com/item'});
assert.strictEqual(normalized.price,49.97);
assert.strictEqual(normalized.verified,true);
assert.strictEqual(normalized.evidenceQuality,.9);
assert.strictEqual(H.productKey({retailer:'Home Depot',sku:'ABC',storeId:'100'}),'Home Depot|ABC|100');
const event=H.normalizeMarkdownEvent({retailer:'Home Depot',sku:'ABC',storeId:'100',fromPrice:'99',toPrice:'49.97',dropPct:'49.5',observedAt:'2026-08-30T01:00:00Z',verified:true,evidenceQuality:.9});
assert.strictEqual(event.toPrice,49.97);
assert(H.markdownEventKey(event).includes('Home Depot|ABC|100|2026-08-30T01:00:00Z|49.97'));
const summary=H.summarize(rows,{retailer:'Home Depot',sku:'ABC',storeId:'100'});
assert.deepStrictEqual({count:summary.count,min:summary.min,max:summary.max},{count:3,min:99,max:499});
assert.strictEqual(summary.verifiedCount,1);

const opportunity=E.evaluateOpportunity({retailer:'Home Depot',sku:'ABC',storeId:'100',price:99,referencePrice:499,priceHistory:[499,499,479,499,499,499,489,499,499,499,499,499,499,499],comps:{d30:350,d60:340,d90:330,soldCount:35},feeRate:.135,shipping:20,taxRate:.06,evidenceQuality:.95});
const withPenny={...opportunity,penny:{score:88,label:'Very High'},observedAt:'2026-08-30T02:45:00Z'};
const decision=A.shouldAlert(withPenny,{now:new Date('2026-08-30T03:00:00Z').getTime()});
assert.strictEqual(decision.alert,true);
assert(decision.priority>=A.alertPriority(opportunity));
assert(A.alertFingerprint(withPenny).includes('Home Depot|ABC|100|99'));
assert(A.alertFingerprint(withPenny).endsWith('p80'));
const first=A.shouldNotify(withPenny,null,{now:new Date('2026-08-30T03:00:00Z').getTime()});
assert.strictEqual(first.notify,true);
assert.strictEqual(first.reason,'new');
const previous={fingerprint:first.fingerprint,priority:first.decision.priority,notifiedAt:'2026-08-30T02:30:00Z'};
const duplicate=A.shouldNotify(withPenny,previous,{now:new Date('2026-08-30T03:00:00Z').getTime()});
assert.strictEqual(duplicate.notify,false);
assert.strictEqual(duplicate.reason,'duplicate-suppressed');
const changed={...withPenny,price:79};
assert.strictEqual(A.shouldNotify(changed,previous,{now:new Date('2026-08-30T03:00:00Z').getTime()}).reason,'state-changed');
const weak={...opportunity,flipScore:20,economics:{...opportunity.economics,profit:10,roi:5},anomaly:{...opportunity.anomaly,confidence:20},penny:{score:95}};
assert.strictEqual(A.shouldAlert(weak).alert,false);
const lowEvidence={...withPenny,evidenceQuality:.2};
assert(A.shouldAlert(lowEvidence,{now:new Date('2026-08-30T03:00:00Z').getTime()}).reasons.includes('evidence-quality'));
const stale={...withPenny,observedAt:'2026-08-20T00:00:00Z'};
assert(A.shouldAlert(stale,{now:new Date('2026-08-30T03:00:00Z').getTime()}).reasons.includes('stale-observation'));
const nonHd={...withPenny,retailer:'Best Buy'};
assert(A.alertPriority(withPenny)>A.alertPriority(nonHd));
assert.strictEqual(A.rankAlerts([weak,withPenny],{now:new Date('2026-08-30T03:00:00Z').getTime()}).length,1);
console.log('HUNTIQ history + alert tests passed',{priority:decision.priority,flipScore:opportunity.flipScore,profit:opportunity.economics.profit,roi:opportunity.economics.roi});