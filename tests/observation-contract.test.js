'use strict';

const assert = require('assert');
const retailerFixture = require('./fixtures/retailerapi-product.json');
const brightFixture = require('./fixtures/brightdata-home-depot-snapshot.json');
const {
  normalizeLiveObservation,
  locationKey,
  attachObservationAliases,
  toLegacyHistoryFields,
  toRightsContractFields
} = require('../lib/live-ingestion');
const { normalizeHomeDepotRecords } = require('../lib/brightdata-home-depot');
const { prepareRetailerApiIngestion } = require('../lib/retailerapi');
const { toObservationRow } = require('../lib/live-history');
const Rights = require('../lib/retailer-observation-contract');

const fromInventory = normalizeLiveObservation({
  sku: 'SKU-1',
  inventory: 4,
  price: 12.5,
  zipcode: '18360',
  url: 'https://www.homedepot.com/p/example/1',
  timestamp: '2026-09-07T12:00:00Z'
}, { retailer: 'Home Depot', provider: 'bright-data', channel: 'store' });

assert.equal(fromInventory.quantity, 4);
assert.equal(fromInventory.inventory, 4);
assert.equal(fromInventory.inventoryCount, 4);
assert.equal(fromInventory.zip, '18360');
assert.equal(fromInventory.zipcode, '18360');
assert.equal(fromInventory.channel, 'local');
assert.equal(fromInventory.storeId, null);
assert.equal(fromInventory.provider, 'bright-data');
assert.equal(fromInventory.sourceFamily, 'licensed-collection');
assert.equal(typeof fromInventory.source, 'object');
assert.equal(fromInventory.source.provider, 'bright-data');
assert.equal(fromInventory.sourceUrl, 'https://www.homedepot.com/p/example/1');
assert.equal(fromInventory.url, fromInventory.source.evidenceUrl);
assert.equal(fromInventory.currentPrice, 12.5);
assert.equal(fromInventory.locationKey, locationKey(fromInventory));
assert.ok(fromInventory.locationKey.includes('|local|zip:18360'));

const legacy = toLegacyHistoryFields(fromInventory);
assert.equal(typeof legacy.source, 'string');
assert.equal(legacy.source, 'bright-data');
assert.equal(legacy.inventory, 4);
assert.equal(legacy.storeId, 'zip:18360');
assert.equal(fromInventory.storeId, null, 'canonical storeId stays null for ZIP-only local rows');

const rights = toRightsContractFields(fromInventory);
assert.equal(rights.storeId, 'zip:18360');
assert.equal(rights.currentPrice, 12.5);
assert.equal(rights.inventoryCount, 4);
assert.equal(typeof rights.source, 'string');
assert.equal(Rights.validateRetailObservation(rights).ok, true);

const bright = attachObservationAliases(normalizeHomeDepotRecords(brightFixture, { zip: '18360' })[0]);
assert.equal(bright.zip, '18360');
assert.equal(bright.zipcode, '18360');
assert.equal(bright.channel, 'local');
assert.equal(bright.source.provider, 'bright-data');
assert.equal(bright.provider, 'bright-data');
assert.equal(toObservationRow(bright).source_url, bright.source.evidenceUrl);
assert.equal(toObservationRow(bright).zipcode, '18360');

const retailerBatch = prepareRetailerApiIngestion(retailerFixture, { retrievedAt: '2026-09-02T19:00:00Z' });
assert.ok(retailerBatch.observations.length >= 1);
for (const row of retailerBatch.observations) {
  assert.equal(row.channel, 'online');
  assert.equal(row.storeId, null);
  assert.equal(row.zip, null);
  assert.equal(row.zipcode, null);
  assert.equal(typeof row.source, 'object');
  assert.equal(row.provider, 'retailerapi');
  assert.equal(row.sourceFamily, 'aggregator-api');
  assert.equal(row.currentPrice, row.price);
  assert.equal(row.inventory, row.quantity);
  assert.ok(row.locationKey.endsWith('|online'));
}

console.log('observation-contract tests passed');
