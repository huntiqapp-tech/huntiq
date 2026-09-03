import assert from 'node:assert/strict';
import {compareResaleExitRoutes} from '../lib/resale-exit-route.js';

const result=compareResaleExitRoutes({
  acquisitionCost:50,
  routes:[
    {name:'Marketplace A',salePrice:100,feeRate:0.15,shippingCost:10,confidence:0.9,sellThrough:0.8},
    {name:'Marketplace B',salePrice:110,feeRate:0.20,shippingCost:14,confidence:0.5,sellThrough:0.3}
  ]
});
assert.equal(result.bestRoute.name,'Marketplace A');
assert.equal(result.blocked,false);
assert.ok(result.bestRoute.riskAdjustedProfit>0);
assert.ok(result.routeAdvantage>0);

const weak=compareResaleExitRoutes({acquisitionCost:80,routes:[{name:'Weak route',salePrice:90,feeRate:0.2,shippingCost:10,confidence:0.4,sellThrough:0.2}]});
assert.equal(weak.blocked,true);
assert.equal(weak.alertAction,'digest');

const lowConfidence=compareResaleExitRoutes({acquisitionCost:20,routes:[{name:'Thin route',salePrice:60,feeRate:0.1,shippingCost:5,confidence:0.4,sellThrough:0.2}]});
assert.equal(lowConfidence.blocked,false);
assert.equal(lowConfidence.alertAction,'standard');

console.log('resale exit-route tests passed');
