'use strict';

const assert = require('assert');
const {
  sameIdentity,
  observationHash,
  reviewProviderValidationRun,
  promoteValidatedObservation
} = require('../lib/provider-validation-review');

const providerObservation = {
  retailer: 'Home Depot',
  productId: '123456',
  sku: '1001234567',
  storeId: '4120',
  zip: '18360',
  channel: 'store',
  price: 129,
  observedAt: '2026-09-04T06:30:00Z',
  source: { provider: 'brightdata', providerRecordId: 'row-1' }
};

const sourceObservation = { ...providerObservation };

assert.deepStrictEqual(sameIdentity(providerObservation, sourceObservation).mismatches, []);
assert.strictEqual(observationHash(providerObservation).length, 64);

const validated = reviewProviderValidationRun({
  provider: 'brightdata',
  retailer: 'Home Depot',
  snapshotId: 'snap_123',
  providerStatus: 'ready',
  normalizedCount: 1
}, {
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  retentionAllowed: true,
  redistributionAllowed: true,
  providerObservation,
  sourceObservation,
  checkedAt: '2026-09-04T06:35:00Z'
});

assert.strictEqual(validated.validationState, 'validated');
assert.strictEqual(validated.historyPromotionAllowed, true);
assert.strictEqual(validated.alertsEnabled, false);
assert.deepStrictEqual(validated.blockers, []);

const promoted = promoteValidatedObservation(providerObservation, validated);
assert.strictEqual(promoted.validationState, 'validated-history');
assert.strictEqual(promoted.historyEligible, true);
assert.strictEqual(promoted.alertEligible, false);
assert.strictEqual(promoted.source.redistributionAllowed, true);

const mismatch = reviewProviderValidationRun({
  provider: 'brightdata',
  retailer: 'Home Depot',
  providerStatus: 'ready',
  normalizedCount: 1
}, {
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  retentionAllowed: true,
  redistributionAllowed: true,
  providerObservation,
  sourceObservation: { ...sourceObservation, storeId: '9999' },
  checkedAt: '2026-09-04T06:35:00Z'
});
assert.strictEqual(mismatch.validationState, 'shadow-review-required');
assert.ok(mismatch.blockers.some(item => item.startsWith('identity-mismatch:')));

const priceMismatch = reviewProviderValidationRun({
  provider: 'brightdata',
  retailer: 'Home Depot',
  providerStatus: 'ready',
  normalizedCount: 1
}, {
  manualSourceCheckPassed: true,
  customerDisplayAllowed: true,
  retentionAllowed: true,
  redistributionAllowed: true,
  providerObservation,
  sourceObservation: { ...sourceObservation, price: 149 },
  checkedAt: '2026-09-04T06:35:00Z'
});
assert.ok(priceMismatch.blockers.includes('manual-price-mismatch'));
assert.throws(() => promoteValidatedObservation(providerObservation, priceMismatch), /validated provider review required/);

const rightsMissing = reviewProviderValidationRun({
  provider: 'brightdata',
  retailer: 'Home Depot',
  providerStatus: 'ready',
  normalizedCount: 1
}, {
  manualSourceCheckPassed: true,
  customerDisplayAllowed: false,
  retentionAllowed: false,
  redistributionAllowed: false,
  providerObservation,
  sourceObservation,
  checkedAt: '2026-09-04T06:35:00Z'
});
assert.strictEqual(rightsMissing.historyPromotionAllowed, false);
assert.strictEqual(rightsMissing.alertsEnabled, false);
assert.ok(rightsMissing.blockers.includes('retention-rights-unverified'));

const incomplete = reviewProviderValidationRun({
  provider: 'brightdata',
  retailer: 'Home Depot',
  providerStatus: 'running',
  normalizedCount: 0
}, {});
assert.strictEqual(incomplete.validationState, 'shadow-review-required');
assert.ok(incomplete.blockers.includes('provider-run-not-complete'));
assert.ok(incomplete.blockers.includes('no-normalized-observations'));

console.log('provider validation review tests passed');
