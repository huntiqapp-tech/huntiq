const assert=require('assert');
const Q=require('../lib/history-query.js');
const rows=[
{retailer:'Home Depot',sku:'A',storeId:'18360',price:500,observedAt:'2025-01-01T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',price:500,observedAt:'2026-08-01T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',price:450,observedAt:'2026-08-20T00:00:00Z',verified:true,sourceFamily:'retailer'},
{retailer:'Home Depot',sku:'A',storeId:'18360',price:99,observedAt:'2026-08-30T12:00:00Z',verified:false,sourceFamily:'community'},
{retailer:'Home Depot',sku:'A',storeId:'18360',price:1,observedAt:'2026-09-02T00:00:00Z',verified:false,sourceFamily:'bad-future'},
{retailer:'Home Depot',sku:'B',storeId:'18360',price:20,observedAt:'2026-08-20T00:00:00Z'}
];
const now='2026-08-30T16:00:00Z';
const w=Q.windowObservations(rows,{retailer:'Home Depot',sku:'A',storeId:'18360'},{now,days:90});
assert.deepStrictEqual(w.map(r=>r.price),[500,450,99],'window should exclude stale, future and other-product rows');
const c=Q.coverage(rows,{retailer:'Home Depot',sku:'A',storeId:'18360'},{now,days:90});
assert.strictEqual(c.count,3);assert.strictEqual(c.distinctDays,3);assert.strictEqual(c.sourceFamilies,2);assert.strictEqual(c.priceChanges,2);assert(c.verifiedRatio>.6&&c.verifiedRatio<.7);
const removable=Q.retentionCandidates(rows,{now,retentionDays:365});
assert(removable.some(r=>r.observedAt==='2025-01-01T00:00:00Z'));
assert(!removable.some(r=>r.observedAt==='2026-09-02T00:00:00Z'),'latest/future row is never auto-selected for deletion');
console.log('HUNTIQ history query tests passed',{window:w.length,coverage:c,removable:removable.length});