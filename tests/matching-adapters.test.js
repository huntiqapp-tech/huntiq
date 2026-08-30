const assert=require('assert');
const M=require('../lib/matching');
const A=require('../lib/adapters');

const retail={title:'Milwaukee M18 FUEL 1/2 in Hammer Drill',brand:'Milwaukee',model:'2904-20',upc:'045242637331'};
let r=M.productMatch(retail,{title:'Milwaukee 2904-20 M18 FUEL Hammer Drill',brand:'Milwaukee',model:'2904-20',upc:'045242637331',condition:'New'});
assert(r.score>=95&&r.label==='Exact','exact UPC should dominate matching');
r=M.productMatch(retail,{title:'Milwaukee M18 Drill Older Gen',brand:'Milwaukee',model:'2804-20',upc:'045242999999'});
assert.strictEqual(r.score,0,'different UPC must hard-fail');
r=M.productMatch({title:'Apple AirPods Pro 2nd Gen USB-C',brand:'Apple',model:'MTJV3AM/A'},{title:'Apple AirPods Pro 2nd Gen USB-C Bundle with Case',brand:'Apple',model:'MTJV3AM/A'});
assert(r.score<90&&r.reasons.includes('bundle-mismatch'),'bundle mismatch must reduce confidence');
r=M.productMatch({title:'DeWalt 20V MAX Drill',brand:'DeWalt',model:'DCD800B'},{title:'DEWALT DCD800B 20V Drill Refurbished',brand:'DeWalt',model:'DCD800B',condition:'Refurbished'});
assert(r.score<90&&r.reasons.includes('refurb-mismatch'),'refurb mismatch must reduce confidence');

const bb=A.normalizeBestBuyProduct({sku:6531631,name:'Example TV',manufacturer:'Example',modelNumber:'TV-55',upc:'123456789012',regularPrice:599.99,salePrice:399.99,url:'https://example.test/p'},{storeId:'123',availability:'in-stock'});
assert.deepStrictEqual([bb.retailer,bb.sku,bb.storeId,bb.currentPrice,bb.regularPrice],['Best Buy','6531631','123',399.99,599.99]);
assert.strictEqual(bb.verificationState,'retailer-api');
const ebay=A.normalizeResaleListing({itemId:'v1|1|0',title:'Example TV',price:{value:'450.00'},shippingOptions:[{shippingCost:{value:'20.00'}}],itemWebUrl:'https://example.test/e'},{marketplace:'eBay'});
assert.strictEqual(ebay.price,450);assert.strictEqual(ebay.shipping,20);assert.strictEqual(ebay.marketplace,'eBay');
console.log('matching-adapters tests passed');
