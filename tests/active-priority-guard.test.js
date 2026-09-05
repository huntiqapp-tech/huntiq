'use strict';

const assert = require('assert');
const { checkChangedFiles, EXCEPTION_RECORD } = require('../scripts/check-active-priority');

assert.deepStrictEqual(checkChangedFiles([
  'lib/retailerapi.js',
  'lib/customer-live-payload.js',
  'tests/retailerapi.test.js'
]), []);

assert.deepStrictEqual(checkChangedFiles([
  'lib/resale-freshness.js',
  'tests/resale-freshness.test.js'
]), [
  'lib/resale-freshness.js',
  'tests/resale-freshness.test.js'
]);

assert.deepStrictEqual(checkChangedFiles([
  'lib/resale-freshness.js',
  EXCEPTION_RECORD
]), []);

console.log('active live-data priority guard tests passed');
