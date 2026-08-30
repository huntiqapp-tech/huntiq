const assert=require('assert');
const Q=require('../lib/history-query.js');
const rows=[
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup',price:500,observedAt:'2025-01-01T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup',price:500,observedAt:'2026-08-01T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup',price:450,observedAt:'2026-08-20T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup',price:99,observedAt:'2026-08-30T12:00:00Z',verified:false,sourceFamily:'community'},
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'shipping',price:610,observedAt:'2026-08-30T13:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup',price:1,observedAt:'2026-09-02T00:00:00Z',verified:false,sourceFamily:'bad-future'},
{retailer:'Home Depot',sku:'B',storeId:'18360',channel:'pickup',price:20,observedAt:'2026-08-20T00:00:00Z'}
];
const now='2026-08-30T16:00:00Z';
const w=Q.windowObservations(rows,{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup'},{now,days:90});
assert.deepStrictEqual(w.map(r=>r.price),[500,450,99],'window should exclude stale, future, other-product and other-channel rows');
const shipping=Q.windowObservations(rows,{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'shipping'},{now,days:90});
assert.deepStrictEqual(shipping.map(r=>r.price),[610],'shipping price must remain isolated from pickup history');
const c=Q.coverage(rows,{retailer:'Home Depot',sku:'A',storeId:'18360',channel:'pickup'},{now,days:90});
assert.strictEqual(c.count,3);assert.strictEqual(c.distinctDays,3);assert.strictEqual(c.sourceFamilies,2);assert.strictEqual(c.priceChanges,2);assert.strictEqual(c.channels,1);assert(c.verifiedRatio>.6&&c.verifiedRatio<.7);
const removable=Q.retentionCandidates(rows,{now,retentionDays:365});
assert(removable.some(r=>r.observedAt==='2025-01-01T00:00:00Z'));
assert(!removable.some(r=>r.observedAt==='2026-09-02T00:00:00Z'),'latest/future row is never auto-selected for deletion');
console.log('HUNTIQ history query tests passed',{window:w.length,shipping:shipping.length,coverage:c,removable:removable.length});