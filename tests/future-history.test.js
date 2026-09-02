'use strict';
const assert=require('assert');
const {assessHistory}=require('../lib/history-anomaly');
const asOf='2026-09-02T13:00:00.000Z';
const observations=[
 {price:100,observedAt:'2026-08-01T13:00:00.000Z'},
 {price:100,observedAt:'2026-08-10T13:00:00.000Z'},
 {price:100,observedAt:'2026-08-20T13:00:00.000Z'},
 {price:1,observedAt:'2026-09-03T13:00:00.000Z'}
];
const out=assessHistory({currentPrice:50,observations,asOf});
assert.equal(out.futureObservationCount,1);
assert.equal(out.sampleCount,3,'future snapshot must not increase sample strength');
assert.equal(out.baseline,100,'future snapshot must not distort the historical baseline');
console.log('future history tests passed');