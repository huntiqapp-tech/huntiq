import assert from 'node:assert/strict';
import {assessPriceRarityRisk} from '../lib/price-rarity-risk.js';

const rare=assessPriceRarityRisk({currentPrice:40,expectedProfit:45,roi:112.5,anomalyScore:0.9,history:[100,95,90,92,88,96,91,89,94,93,97,86]});
assert.equal(rare.isNewLow,true);
assert.ok(rare.rarityScore>=0.82);
assert.equal(rare.alertAction,'preserve');
assert.ok(rare.confidenceAdjustedProfit>40);
assert.ok(rare.adjustedAnomalyScore>0.8);

const recurring=assessPriceRarityRisk({currentPrice:50,expectedProfit:30,roi:60,anomalyScore:0.9,history:[50,49,51,50,52,50,49,50,51,50,52,49]});
assert.ok(recurring.rarityScore<0.25);
assert.equal(recurring.alertAction,'digest');
assert.ok(recurring.confidenceAdjustedProfit<30);
assert.ok(recurring.adjustedAnomalyScore<0.7);

const thin=assessPriceRarityRisk({currentPrice:40,expectedProfit:20,roi:50,history:[80,75]});
assert.equal(thin.alertAction,'standard');
assert.equal(thin.sampleSize,2);

const dated=assessPriceRarityRisk({currentPrice:50,expectedProfit:20,roi:40,asOf:'2026-09-03T00:00:00Z',history:[{price:51,observedAt:'2026-08-24T00:00:00Z'},{price:90,observedAt:'2026-08-20T00:00:00Z'},{price:100,observedAt:'2026-08-01T00:00:00Z'}]});
assert.equal(dated.daysSinceComparableLow,10);

console.log('price rarity risk tests passed');
