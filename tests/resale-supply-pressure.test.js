import assert from 'node:assert/strict';
import { assessResaleSupplyPressure } from '../lib/resale-supply-pressure.js';

const healthy=assessResaleSupplyPressure({activeListings:10,soldCount:20,soldWindowDays:30,acquisitionCost:50,resaleValue:100,marketplaceFeeRate:0.13,shippingCost:8});
assert.equal(healthy.level,'healthy');
assert.equal(healthy.haircut,0);
assert.equal(healthy.blocked,false);
assert.equal(healthy.adjustedProfit,29);

const elevated=assessResaleSupplyPressure({activeListings:30,soldCount:10,soldWindowDays:30,acquisitionCost:50,resaleValue:100,marketplaceFeeRate:0.13,shippingCost:8});
assert.equal(elevated.level,'elevated');
assert.equal(elevated.haircut,0.10);
assert.ok(elevated.adjustedProfit<healthy.adjustedProfit);
assert.equal(elevated.alertAction,'standard');

const severe=assessResaleSupplyPressure({activeListings:90,soldCount:10,soldWindowDays:30,acquisitionCost:50,resaleValue:100,marketplaceFeeRate:0.13,shippingCost:8});
assert.equal(severe.level,'severe');
assert.equal(severe.alertAction,'digest');
assert.ok(severe.marketInventoryDays>200);

const noSales=assessResaleSupplyPressure({activeListings:25,soldCount:0,soldWindowDays:30,acquisitionCost:40,resaleValue:90});
assert.equal(noSales.level,'blocked');
assert.equal(noSales.blocked,true);
assert.equal(noSales.alertAction,'digest');

const loss=assessResaleSupplyPressure({activeListings:2,soldCount:20,acquisitionCost:90,resaleValue:100,marketplaceFeeRate:0.13,shippingCost:10});
assert.equal(loss.level,'healthy');
assert.equal(loss.blocked,true);
assert.equal(loss.alertAction,'digest');

console.log('resale supply pressure tests passed');
