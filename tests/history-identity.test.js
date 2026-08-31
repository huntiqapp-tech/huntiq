const assert=require('assert');
const history=require('../lib/history-query');
const baseline=require('../lib/baseline');
const now=Date.UTC(2026,7,31,4,0,0);
const base={retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',verified:true,sourceFamily:'public'};
const rows=[
 {...base,price:199,condition:'new',priceScope:'public',observedAt:new Date(now-10*864e5).toISOString()},
 {...base,price:205,condition:'new',priceScope:'public',observedAt:new Date(now-7*864e5).toISOString()},
 {...base,price:49,condition:'open box',priceScope:'public',observedAt:new Date(now-6*864e5).toISOString()},
 {...base,price:149,condition:'new',priceScope:'member',observedAt:new Date(now-5*864e5).toISOString()},
 {...base,price:201,condition:'new',priceScope:'public',observedAt:new Date(now-2*864e5).toISOString()}
];
const publicNew=history.windowObservations(rows,{retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',condition:'new',priceScope:'public'},{now,days:30});
assert.strictEqual(publicNew.length,3,'open-box and member observations must not contaminate public new history');
assert(publicNew.every(r=>history.conditionOf(r)==='new'&&history.priceScopeOf(r)==='public'));
const b=baseline.robustBaseline(rows,{retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',condition:'new',priceScope:'public'},{now,minSpacingHours:0});
assert(b.median>=199&&b.median<=205,'baseline median must reflect only comparable public-new observations');
const a=baseline.scorePriceAnomaly(99,b);
assert(a.dropPct>50,'isolated baseline should preserve a genuine markdown signal');
const old=new Date(now-400*864e5).toISOString();
const retained=history.retentionCandidates([
 {...base,price:200,condition:'new',priceScope:'public',observedAt:old},
 {...base,price:60,condition:'open box',priceScope:'public',observedAt:old}
],{now,retentionDays:365});
assert.strictEqual(retained.length,0,'retention must preserve the latest record for each condition/scope identity');
console.log('history identity tests passed');