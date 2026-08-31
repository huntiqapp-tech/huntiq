const assert = require('assert');
const { buildHistoryIndex, priorPrices, observationContext, evaluateLiveObservation, evaluateLiveAlert, toObservationRow } = require('../lib/live-history');

const base = { retailer:'home depot', productId:'319386960', sku:'1007172275', storeId:'4129', source:{provider:'bright-data', rightsClass:'internal-only'} };
const observations = [
  {...base, price:199, zip:'18360', channel:'local', observedAt:'2026-08-01T12:00:00Z'},
  {...base, price:149, zip:'18360', channel:'local', observedAt:'2026-08-10T12:00:00Z'},
  {...base, price:99, zip:'18360', channel:'local', observedAt:'2026-08-20T12:00:00Z'},
  {...base, price:49.03, zip:'18360', channel:'local', availability:'in_stock', quantity:3, observedAt:'2026-08-31T12:00:00Z'},
  {...base, storeId:'4188', price:179, zip:'18064', channel:'local', observedAt:'2026-08-20T12:00:00Z'}
];
const index = buildHistoryIndex(observations);
assert.deepEqual(priorPrices(observations[3], index), [199,149,99], 'history should contain only prior prices from the same location');
assert.deepEqual(priorPrices(observations[4], index), [], 'another ZIP/store must not contaminate local history');

const context = observationContext(observations[3]);
assert.equal(context.storeId, '4129');
assert.equal(context.zip, '18360');
assert.equal(context.observedAt, '2026-08-31T12:00:00Z');
assert.equal(context.availability, 'in_stock');
assert.equal(context.quantity, 3);

const options = {
  historyIndex:index,
  comps:{d30:150,d60:145,d90:140,soldCount:30,soldWindowDays:90,activeListingCount:5},
  economics:{feeRate:.135,shipping:12,taxRate:.06}
};
const result = evaluateLiveObservation(observations[3], options);
assert.equal(result.priceHistory.length, 3);
assert.equal(result.storeId, '4129', 'store context must survive into scoring and alert fingerprinting');
assert.equal(result.zip, '18360');
assert.equal(result.observedAt, '2026-08-31T12:00:00Z', 'freshness guardrails need the source observation timestamp');
assert.ok(result.anomaly.dropPct > 50, 'markdown should register against location history');
assert.ok(result.economics.profit > 0, 'live observation should flow into profit calculations');
assert.ok(result.economics.roi > 0, 'live observation should flow into ROI calculations');
assert.ok(result.flipScore > 0, 'live observation should reach HUNTIQ scoring');

const alertResult = evaluateLiveAlert(observations[3], {...options, alertOptions:{now:new Date('2026-09-05T12:00:00Z').getTime()}});
assert.equal(alertResult.historyKey, 'home depot|319386960|store:4129');
assert.ok(alertResult.notification && alertResult.notification.decision, 'live pipeline should always produce an alert decision');
assert.ok(alertResult.notification.decision.reasons.includes('stale-observation'), 'stale live data must not generate a notification');
assert.equal(alertResult.notification.notify, false);

const row = toObservationRow(observations[3]);
assert.equal(row.zipcode, '18360');
assert.equal(row.store_id, '4129');
assert.equal(row.provider, 'bright-data');
assert.equal(row.rights_class, 'internal-only');
assert.ok(row.location_key.includes('4129'));

console.log('live-history tests passed');
