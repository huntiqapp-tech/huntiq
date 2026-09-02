'use strict';

const MIN_SOURCE_RELIABILITY = 70;
const MIN_OBSERVATION_CONFIDENCE = 65;

function clean(value) {
  return value == null ? null : String(value).trim() || null;
}

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function assessHistoryPromotion(observation = {}, {
  sourceReliability = 100,
  observationConfidence = 100,
  validationState = 'validated',
  asOf = new Date().toISOString(),
  maxAgeHours = 48
} = {}) {
  const blockers = [];
  const warnings = [];
  const source = observation.source || {};
  const observedAt = Date.parse(observation.observedAt);
  const now = Date.parse(asOf);
  const ageHours = Number.isFinite(observedAt) && Number.isFinite(now) ? (now - observedAt) / 36e5 : null;
  const reliability = finite(sourceReliability);
  const confidence = finite(observationConfidence);
  const retentionPolicy = clean(source.retentionPolicy);
  const redistributionAllowed = source.redistributionAllowed === true;
  const rightsClass = clean(source.rightsClass);

  if (!observation.retailer || !observation.sku || !Number.isFinite(Number(observation.price))) blockers.push('invalid-observation');
  if (validationState !== 'validated') blockers.push('source-not-validated');
  if (!Number.isFinite(ageHours)) blockers.push('missing-freshness');
  else if (ageHours < -5 / 60) blockers.push('future-observation');
  else if (ageHours > maxAgeHours) blockers.push('stale-observation');

  if (!rightsClass || rightsClass === 'unknown') blockers.push('unknown-rights');
  if (!retentionPolicy || retentionPolicy === 'unknown' || retentionPolicy === 'ephemeral') blockers.push('retention-not-authorized');
  if (reliability == null || reliability < MIN_SOURCE_RELIABILITY) blockers.push('weak-source-reliability');
  if (confidence == null || confidence < MIN_OBSERVATION_CONFIDENCE) blockers.push('weak-observation-confidence');
  if (!redistributionAllowed) warnings.push('redistribution-disabled');

  return {
    eligibleForPersistentHistory: blockers.length === 0,
    eligibleForCustomerRedistribution: blockers.length === 0 && redistributionAllowed,
    ageHours: ageHours == null ? null : +Math.max(0, ageHours).toFixed(2),
    sourceReliability: reliability,
    observationConfidence: confidence,
    rightsClass,
    retentionPolicy,
    redistributionAllowed,
    blockers,
    warnings
  };
}

function partitionHistoryCandidates(observations = [], options = {}) {
  const accepted = [];
  const rejected = [];
  for (const observation of observations) {
    const assessment = assessHistoryPromotion(observation, options);
    const entry = { observation, assessment };
    if (assessment.eligibleForPersistentHistory) accepted.push(entry);
    else rejected.push(entry);
  }
  return { accepted, rejected };
}

module.exports = {
  MIN_SOURCE_RELIABILITY,
  MIN_OBSERVATION_CONFIDENCE,
  assessHistoryPromotion,
  partitionHistoryCandidates
};
