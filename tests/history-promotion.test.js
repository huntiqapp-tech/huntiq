'use strict';

const assert = require('assert');
const { assessHistoryPromotion, partitionHistoryCandidates } = require('../lib/history-promotion');

const asOf = '2026-09-02T21:00:00.000Z';
const baseObservation = {
  retailer: 'example',
  sku: 'ABC123',
  price: 19.99,
  observedAt: '2026-09-02T20:00:00.000Z',
  source: {
    rightsClass: 'licensed-internal-history',
    retentionPolicy: 'persistent',
    redistributionAllowed: false
  }
};

{
  const result = assessHistoryPromotion(baseObservation, { asOf, validationState: 'validated', sourceReliability: 92, observationConfidence: 90 });
  assert.equal(result.eligibleForPersistentHistory, true);
  assert.equal(result.eligibleForCustomerRedistribution, false);
  assert.deepEqual(result.blockers, []);
  assert(result.warnings.includes('redistribution-disabled'));
}

{
  const result = assessHistoryPromotion({
    ...baseObservation,
    source: { ...baseObservation.source, retentionPolicy: 'unknown' }
  }, { asOf, validationState: 'validated', sourceReliability: 92, observationConfidence: 90 });
  assert.equal(result.eligibleForPersistentHistory, false);
  assert(result.blockers.includes('retention-not-authorized'));
}

{
  const result = assessHistoryPromotion(baseObservation, { asOf, validationState: 'shadow', sourceReliability: 92, observationConfidence: 90 });
  assert.equal(result.eligibleForPersistentHistory, false);
  assert(result.blockers.includes('source-not-validated'));
}

{
  const stale = { ...baseObservation, observedAt: '2026-08-30T20:00:00.000Z' };
  const result = assessHistoryPromotion(stale, { asOf, validationState: 'validated', sourceReliability: 92, observationConfidence: 90, maxAgeHours: 48 });
  assert.equal(result.eligibleForPersistentHistory, false);
  assert(result.blockers.includes('stale-observation'));
}

{
  const result = assessHistoryPromotion(baseObservation, { asOf, validationState: 'validated', sourceReliability: 60, observationConfidence: 90 });
  assert.equal(result.eligibleForPersistentHistory, false);
  assert(result.blockers.includes('weak-source-reliability'));
}

{
  const redistributable = {
    ...baseObservation,
    source: { ...baseObservation.source, redistributionAllowed: true }
  };
  const result = assessHistoryPromotion(redistributable, { asOf, validationState: 'validated', sourceReliability: 92, observationConfidence: 90 });
  assert.equal(result.eligibleForCustomerRedistribution, true);
}

{
  const result = partitionHistoryCandidates([
    baseObservation,
    { ...baseObservation, sku: 'STALE', observedAt: '2026-08-30T20:00:00.000Z' }
  ], { asOf, validationState: 'validated', sourceReliability: 92, observationConfidence: 90 });
  assert.equal(result.accepted.length, 1);
  assert.equal(result.rejected.length, 1);
}

console.log('history-promotion tests passed');
