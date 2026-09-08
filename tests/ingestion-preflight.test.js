'use strict';

const assert = require('assert');
const { reportIngestionPreflight, SECRET_CATALOG } = require('../lib/ingestion-preflight');

const empty = reportIngestionPreflight({
  env: {},
  providers: ['brightdata', 'retailerapi', 'upcitemdb'],
  mode: 'live'
});
assert.equal(empty.mode, 'live');
assert.equal(empty.failClosed, true);
assert.equal(empty.liveReady, false);
assert.deepEqual(empty.configuredNames, []);
assert.ok(empty.missingRequiredNames.includes('BRIGHTDATA_API_TOKEN'));
assert.ok(empty.missingRequiredNames.includes('RETAILERAPI_KEY'));
assert.ok(empty.missingRequiredNames.includes('UPCITEMDB_USER_KEY'));
assert.ok(empty.missingNames.includes('BRIGHTDATA_TEST_ZIP'));
assert.ok(empty.secrets.every((item) => item.configured === false));
assert.ok(!Object.values(empty).some((value) => typeof value === 'string' && /token|password|bearer /i.test(value)));
assert.ok(SECRET_CATALOG.every((item) => empty.secrets.some((row) => row.name === item.name)));

const configured = reportIngestionPreflight({
  env: {
    BRIGHTDATA_API_TOKEN: 'super-secret-token-value',
    BRIGHTDATA_TEST_URL: 'https://www.homedepot.com/p/example/1',
    RETAILERAPI_KEY: 'super-secret-retailer-key'
  },
  providers: ['brightdata', 'retailerapi'],
  mode: 'live'
});
assert.equal(configured.failClosed, false);
assert.ok(configured.configuredNames.includes('BRIGHTDATA_API_TOKEN'));
assert.ok(configured.configuredNames.includes('RETAILERAPI_KEY'));
assert.ok(!JSON.stringify(configured).includes('super-secret-token-value'));
assert.ok(!JSON.stringify(configured).includes('super-secret-retailer-key'));

const dryRun = reportIngestionPreflight({ env: {}, providers: ['retailerapi'], mode: 'dry-run' });
assert.equal(dryRun.failClosed, false);
assert.equal(dryRun.mode, 'dry-run');

const unknown = reportIngestionPreflight({ env: {}, providers: ['not-a-provider'], mode: 'live' });
assert.deepEqual(unknown.unknownProviders, ['not-a-provider']);
assert.equal(unknown.failClosed, true);

console.log('ingestion-preflight tests passed');
