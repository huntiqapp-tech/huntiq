const assert=require('assert');
const R=require('../lib/resale-history.js');
const asOf='2026-09-01T16:00:00.000Z';
const comps=[
 {status:'sold',soldAt:'2026-08-30T16:00:00Z',price:100,shipping:10,matchScore:100,sourceConfidence:95},
 {status:'completed',soldAt:'2026-08-25T16:00:00Z',price:120,shipping:0,matchScore:98,sourceConfidence:95},
 {status:'fulfilled',soldAt:'2026-08-10T16:00:00Z',price:110,shipping:5,matchScore:92,sourceConfidence:90},
 {status:'sold',soldAt:'2026-07-15T16:00:00Z',price:130,shipping:10,matchScore:90,sourceConfidence:90},
 {status:'sold',soldAt:'2026-06-10T16:00:00Z',price:140,shipping:0,matchScore:85,sourceConfidence:85},
 {status:'active',soldAt:'2026-08-31T16:00:00Z',price:999,shipping:0},
 {status:'listed',price:899,shipping:0},
 {status:'cancelled',soldAt:'2026-08-20T16:00:00Z',price:500,shipping:0}
];
const h=R.buildResaleHistory(comps,{asOf});
assert.strictEqual(h.completedSaleOnly,true,'history must advertise completed-sale-only semantics');
assert.strictEqual(h.comparableCount,5,'active/cancelled/listed rows must never enter sold history');
assert.strictEqual(h.windows.d30.count,3,'30-day window should contain exactly three completed sales');
assert.strictEqual(h.windows.d60.count,4,'60-day window should contain four completed sales');
assert.strictEqual(h.windows.d90.count,5,'90-day window should contain five completed sales');
assert.strictEqual(h.windows.d30.median,115,'shipping-inclusive median should be used for customer economics');
assert.strictEqual(h.marketValueWindow,30,'prefer the freshest window once it has at least three comps');
assert.strictEqual(h.marketValue,115,'market value should use the preferred completed-sale window median');
assert(h.resaleConfidence>0&&h.resaleConfidence<=100,'resale confidence must be bounded');
assert.strictEqual(h.evidenceSufficient,true,'three strong recent comps should clear the initial evidence gate');
const polluted=R.buildResaleHistory([{status:'active',soldAt:'2026-08-31T16:00:00Z',price:1000},{status:'listed',price:900}],{asOf});
assert.strictEqual(polluted.comparableCount,0,'asking listings must not contaminate sold history');
assert.strictEqual(polluted.marketValue,null,'no completed sales means no market value');
assert.strictEqual(polluted.evidenceSufficient,false,'asking-only evidence cannot authorize sold-history claims');
const sparse=R.buildResaleHistory([{status:'sold',soldAt:'2026-08-20T16:00:00Z',price:75,shipping:5}],{asOf});
assert.strictEqual(sparse.evidenceSufficient,false,'single-sale evidence must remain insufficient');
assert.strictEqual(R.deliveredPrice({price:50,shipping:12.34}),62.34,'delivered comp value should include shipping');
console.log('HUNTIQ resale history tests passed',h);
