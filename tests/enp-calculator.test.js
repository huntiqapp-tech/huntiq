'use strict';

const assert = require('assert');
const Enp = require('../lib/enp-calculator');

assert.strictEqual(Enp.ROI_BASIS, 'acquisition', 'ROI is documented as acquisition-basis');
assert.ok(Enp.TRUST_LINE.toLowerCase().includes('user-entered'));
assert.ok(!/keepa api|bright data|oxylabs/i.test(Enp.TRUST_LINE));

const missing = Enp.evaluate({});
assert.strictEqual(missing.ok, false);
assert(missing.errors.some((e) => /buy price/i.test(e)));
assert(missing.errors.some((e) => /sell price/i.test(e)));
assert(missing.errors.some((e) => /fba fee or shipping out/i.test(e)));

const buy = Enp.evaluate({
  title: 'M18 demo',
  retailer: 'Home Depot',
  marketplace: 'amazon-fba',
  buyPrice: 20,
  taxRatePct: 6,
  acquireShip: 0,
  units: 2,
  sellPrice: 80,
  conservativeSell: 50,
  optimisticSell: 90,
  referralPct: 15,
  fbaOrShipOut: 10,
  otherFees: 0,
  targetRoi: 30,
  minProfit: 15
});
assert.strictEqual(buy.ok, true);
assert.strictEqual(buy.acquisition, 21.2, 'acquisition = buy + tax(buy) + acquireShip');
assert.strictEqual(buy.sellFees, 22, 'sellFees = referral * sell + FBA + other');
assert.strictEqual(buy.enpPerUnit, 36.8);
assert.strictEqual(buy.enpTotal, 73.6);
assert.strictEqual(buy.roi, 173.58);
assert.strictEqual(buy.roiBasis, 'acquisition');
assert.strictEqual(buy.maxBuyPrice, 40.57);
assert.strictEqual(buy.headroom, 20.57);
assert.strictEqual(buy.breakEvenSell, 36.71);
assert.strictEqual(buy.downsideEnp, 11.3);
assert.strictEqual(buy.upsideEnp, 45.3);
assert.strictEqual(buy.verdict, 'BUY');
assert.strictEqual(buy.heroMetric, 'enp');
assert.ok(!('msrpOffPct' in buy));

const atProfitCap = Enp.evaluate({
  marketplace: 'amazon-fba',
  buyPrice: 40.57,
  taxRatePct: 6,
  acquireShip: 0,
  sellPrice: 80,
  fbaOrShipOut: 10,
  targetRoi: 30,
  minProfit: 15
});
assert.strictEqual(atProfitCap.ok, true);
assert.ok(atProfitCap.enpPerUnit + 0.02 >= 15, 'max buy should still clear min profit');
assert.ok(atProfitCap.roi + 0.05 >= 30, 'max buy should still clear target ROI');
assert.strictEqual(atProfitCap.verdict, 'BUY');

const maybe = Enp.evaluate({
  marketplace: 'amazon-fba',
  buyPrice: 41.5,
  taxRatePct: 6,
  acquireShip: 0,
  sellPrice: 80,
  fbaOrShipOut: 10,
  targetRoi: 30,
  minProfit: 15
});
assert.strictEqual(maybe.verdict, 'MAYBE', 'within 10% of max-buy/profit/ROI targets is MAYBE');
assert.ok(maybe.headroom < 0);

const pass = Enp.evaluate({
  marketplace: 'ebay',
  buyPrice: 50,
  taxRatePct: 6,
  acquireShip: 5,
  sellPrice: 100,
  referralPct: 15,
  fbaOrShipOut: 12,
  otherFees: 3,
  targetRoi: 30,
  minProfit: 15
});
assert.strictEqual(pass.acquisition, 58);
assert.strictEqual(pass.enpPerUnit, 12);
assert.strictEqual(pass.roi, 20.69);
assert.strictEqual(pass.verdict, 'PASS');
assert.strictEqual(Enp.defaultReferralPct('ebay'), 13);
assert.strictEqual(Enp.defaultReferralPct('amazon-fbm'), 15);

const ebayDefault = Enp.evaluate({
  marketplace: 'ebay',
  buyPrice: 20,
  sellPrice: 80,
  fbaOrShipOut: 10
});
assert.strictEqual(ebayDefault.referralPct, 13);

const store = Enp.memoryStore();
const first = Enp.consumeCalculation(store, new Date('2026-09-07T12:00:00'));
const second = Enp.consumeCalculation(store, new Date('2026-09-07T15:00:00'));
const third = Enp.consumeCalculation(store, new Date('2026-09-07T18:00:00'));
const fourth = Enp.consumeCalculation(store, new Date('2026-09-07T20:00:00'));
assert.strictEqual(first.allowed, true);
assert.strictEqual(second.allowed, true);
assert.strictEqual(third.allowed, true);
assert.strictEqual(third.remaining, 0);
assert.strictEqual(fourth.allowed, false);
assert.strictEqual(fourth.locked, true);
const nextDay = Enp.consumeCalculation(store, new Date('2026-09-08T08:00:00'));
assert.strictEqual(nextDay.allowed, true);
assert.strictEqual(nextDay.count, 1);

const history = [];
for (let i = 0; i < 25; i += 1) {
  history.push(...Enp.recordRun(buy, store, new Date(Date.UTC(2026, 8, 7, 0, i))));
}
const kept = Enp.readHistory(store);
assert.strictEqual(kept.length, 20, 'history keeps the last 20 runs');
assert.strictEqual(kept[0].verdict, 'BUY');
assert.strictEqual(kept[0].enpPerUnit, 36.8);

console.log('enp calculator tests passed', {
  verdicts: { buy: buy.verdict, maybe: maybe.verdict, pass: pass.verdict },
  maxBuy: buy.maxBuyPrice,
  roiBasis: buy.roiBasis
});
