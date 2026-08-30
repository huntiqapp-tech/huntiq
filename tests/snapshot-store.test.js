const assert=require('assert');
const S=require('../lib/snapshot-store.js');
const row=S.normalizeSnapshot({retailer:'Home Depot',sku:'123',storeId:'18360',price:'9.03',inventory:'2',verified:true,evidenceQuality:.9,confirmationScore:85,source:'retailer'});
assert.strictEqual(row.product,'Home Depot|123|18360');
assert.strictEqual(row.price,9.03);
assert.strictEqual(row.inventory,2);
assert.strictEqual(row.verified,true);
assert.strictEqual(S.productKey({retailer:'Best Buy',sku:'ABC'}),'Best Buy|ABC|online');
console.log('HUNTIQ snapshot store tests passed',{product:row.product,price:row.price});