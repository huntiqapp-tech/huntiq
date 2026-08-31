const assert = require('assert');
const { buildHistoryIndex, priorPrices, evaluateLiveObservation, toObservationRow } = require('../lib/live-history');

const base = { retailer:'home depot', productId:'319386960', sku:'1007172275', source:{provider:'bright-data', rightsClass:'internal-only'} };
const observations = [
  {...base, price:199, zip:'18360', channel:'local', observedAt:'2026-08-01T12:00:00Z'},
  {...base, price:149, zip:'18360', channel:'local', observedAt:'2026-08-10T12:00:00Z'},
  {...base, price:99, zip:'18360', channel:'local', observedAt:'2026-08-20T12:00:00Z'},
  {...base, price:49.03, zip:'18360', channel:'local', observedAt:'2026-08-31T12:00:00Z'},
  {...base, price:179, zip:'18064', channel:'local', observedAt:'2026-08-20T12:00:00Z'}
];
const index = buildHistoryIndex(observations);
assert.deepEqual(priorPrices(observations[3], index), [199,149,99], 'history should contain only prior prices from the same location');
assert.deepEqual(priorPrices(observations[4], index), [], 'another ZIP must not contaminate local history');

const result = evaluateLiveObservation(observations[3], {
  historyIndex:index,
  comps:{d30:150,d60:145,d90:140,soldCount:30,soldWindowDays:90,activeListingCount:5},
  economics:{feeRate:.135,shipping:12,taxRate:.06}
});
assert.equal(result.priceHistory.length, 3);
assert.ok(result.anomaly.dropPct > 50, 'markdown should register against location history');
assert.ok(result.economics.profit > 0, 'live observation should flow into profit calculations');
assert.ok(result.economics.roi > 0, 'live observation should flow into ROI calculations');
assert.ok(result.flipScore > 0, 'live observation should reach HUNTIQ scoring');

const row = toObservationRow(observations[3]);
assert.equal(row.zipcode, '18360');
assert.equal(row.provider, 'bright-data');
assert.equal(row.rights_class, 'internal-only');
assert.ok(row.location_key.includes('18360'));

console.log('live-history tests passed');
