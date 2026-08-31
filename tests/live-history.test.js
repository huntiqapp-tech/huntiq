const assert = require('assert');
const { buildHistoryIndex, priorPrices, observationContext, inventorySourceType, evaluateLiveObservation, evaluateLiveAlert, toObservationRow } = require('../lib/live-history');

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
assert.equal(inventorySourceType(observations[3]), 'retailer_page', 'Bright Data snapshots should use retailer-page freshness decay');

const options = {
  historyIndex:index,
  comps:{d30:150,d60:145,d90:140,soldCount:90,soldWindowDays:90,activeListingCount:5},
  economics:{feeRate:.135,shipping:12,taxRate:.06},
  fulfillmentOptions:{now:'2026-08-31T13:00:00Z'},
  quantityOptions:{cashBudget:500,targetHoldingDays:30,maxMarketShare:.25}
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
assert.ok(result.fulfillment.confidence > 0, 'live inventory should receive a fulfillment-confidence score');
assert.equal(result.fulfillment.quantity, 3);
assert.equal(result.quantityEconomics.availableUnits, 3, 'reported store quantity should feed lot planning');
assert.equal(result.quantityEconomics.plannedUnits, 3, 'profitable demand and cash limits should permit all three units');
assert.ok(result.quantityEconomics.committedCash > result.economics.totalCost, 'lot planning should expose total capital required');
assert.ok(result.quantityEconomics.lotProfit > result.economics.profit, 'lot planning should expose total profit across available units');
assert.ok(result.quantityEconomics.expectedProfit > 0, 'inventory confidence should produce probability-adjusted expected profit');

const cashLimited = evaluateLiveObservation(observations[3], {...options, quantityOptions:{...options.quantityOptions,cashBudget:70}});
assert.equal(cashLimited.quantityEconomics.plannedUnits, 1, 'cash budget must cap how many clearance units HUNTIQ recommends buying');

const alertResult = evaluateLiveAlert(observations[3], {...options, alertOptions:{now:new Date('2026-09-05T12:00:00Z').getTime()}});
assert.equal(alertResult.historyKey, 'home depot|319386960|store:4129');
assert.ok(alertResult.notification && alertResult.notification.decision, 'live pipeline should always produce an alert decision');
assert.ok(alertResult.notification.decision.reasons.includes('stale-observation'), 'stale live data must not generate a notification');
assert.equal(alertResult.notification.notify, false);
assert.equal(alertResult.opportunity.quantityEconomics.availableUnits, 3, 'alert payload should retain quantity economics');

const row = toObservationRow(observations[3]);
assert.equal(row.zipcode, '18360');
assert.equal(row.store_id, '4129');
assert.equal(row.provider, 'bright-data');
assert.equal(row.rights_class, 'internal-only');
assert.ok(row.location_key.includes('4129'));

console.log('live-history tests passed');
