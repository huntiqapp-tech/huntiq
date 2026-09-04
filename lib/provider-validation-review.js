'use strict';

const crypto = require('crypto');

function clean(value) {
  return value == null ? null : String(value).trim() || null;
}

function validIso(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function finitePrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function approved(value) {
  return value === true || ['approved', 'allowed', 'passed', 'verified'].includes(clean(value)?.toLowerCase());
}

function sameIdentity(expected = {}, actual = {}) {
  const keys = ['retailer', 'productId', 'sku', 'upc', 'modelNumber', 'storeId', 'zip', 'channel'];
  const mismatches = [];
  const ambiguous = [];

  for (const key of keys) {
    const left = clean(expected[key]);
    const right = clean(actual[key]);
    if (!left && !right) continue;
    if (!left || !right) {
      ambiguous.push(key);
      continue;
    }
    if (left.toLowerCase() !== right.toLowerCase()) mismatches.push(key);
  }

  return {
    exact: mismatches.length === 0 && ambiguous.length === 0,
    mismatches,
    ambiguous
  };
}

function observationHash(observation = {}) {
  const stable = {
    retailer: clean(observation.retailer),
    productId: clean(observation.productId),
    sku: clean(observation.sku),
    upc: clean(observation.upc),
    modelNumber: clean(observation.modelNumber),
    storeId: clean(observation.storeId),
    zip: clean(observation.zip),
    channel: clean(observation.channel),
    price: finitePrice(observation.price),
    observedAt: validIso(observation.observedAt || observation.timestamp)
  };
  return crypto.createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}

function reviewProviderValidationRun(run = {}, evidence = {}, options = {}) {
  const blockers = [];
  const cautions = [];
  const providerStatus = clean(run.providerStatus || run.provider_status)?.toLowerCase();
  const normalizedCount = Number(run.normalizedCount ?? run.normalized_count ?? 0);
  const manualPassed = approved(evidence.manualSourceCheckPassed ?? evidence.manualSourceCheckState);
  const displayAllowed = approved(evidence.customerDisplayAllowed ?? evidence.displayRightsState);
  const retentionAllowed = approved(evidence.retentionAllowed ?? evidence.retentionRightsState);
  const redistributionAllowed = approved(evidence.redistributionAllowed ?? evidence.redistributionRightsState);

  if (!['ready', 'completed', 'success', 'succeeded'].includes(providerStatus)) blockers.push('provider-run-not-complete');
  if (!(normalizedCount > 0)) blockers.push('no-normalized-observations');
  if (!manualPassed) blockers.push('manual-source-check-required');
  if (!displayAllowed) blockers.push('customer-display-rights-unverified');
  if (!retentionAllowed) blockers.push('retention-rights-unverified');
  if (!redistributionAllowed) blockers.push('redistribution-rights-unverified');

  const providerObservation = evidence.providerObservation || {};
  const sourceObservation = evidence.sourceObservation || {};
  const identity = sameIdentity(providerObservation, sourceObservation);
  if (identity.mismatches.length) blockers.push(`identity-mismatch:${identity.mismatches.join(',')}`);
  if (identity.ambiguous.length) blockers.push(`identity-ambiguous:${identity.ambiguous.join(',')}`);

  const providerPrice = finitePrice(providerObservation.price);
  const sourcePrice = finitePrice(sourceObservation.price);
  if (providerPrice == null || sourcePrice == null) {
    blockers.push('manual-price-comparison-required');
  } else {
    const toleranceCents = Number.isFinite(Number(options.priceToleranceCents)) ? Math.max(0, Number(options.priceToleranceCents)) : 1;
    const deltaCents = Math.round(Math.abs(providerPrice - sourcePrice) * 100);
    if (deltaCents > toleranceCents) blockers.push('manual-price-mismatch');
  }

  const checkedAt = validIso(evidence.checkedAt);
  if (!checkedAt) blockers.push('manual-check-timestamp-required');
  if (evidence.notes && !clean(evidence.notes)) cautions.push('empty-review-note');

  const validated = blockers.length === 0;
  return {
    provider: clean(run.provider),
    retailer: clean(run.retailer),
    snapshotId: clean(run.snapshotId || run.snapshot_id),
    validationState: validated ? 'validated' : 'shadow-review-required',
    manualSourceCheckPassed: manualPassed,
    customerDisplayAllowed: validated && displayAllowed,
    retentionAllowed: validated && retentionAllowed,
    redistributionAllowed: validated && redistributionAllowed,
    historyPromotionAllowed: validated && retentionAllowed,
    alertsEnabled: false,
    identity,
    checkedAt,
    blockers,
    cautions
  };
}

function promoteValidatedObservation(observation = {}, review = {}) {
  if (review.validationState !== 'validated') throw new Error('validated provider review required');
  if (review.historyPromotionAllowed !== true) throw new Error('history promotion rights required');
  const observedAt = validIso(observation.observedAt || observation.timestamp);
  if (!observedAt) throw new Error('valid observation timestamp required');
  const price = finitePrice(observation.price);
  if (price == null) throw new Error('valid observation price required');
  if (!clean(observation.retailer)) throw new Error('retailer required');

  return {
    ...observation,
    price,
    observedAt,
    validationState: 'validated-history',
    historyEligible: true,
    alertEligible: false,
    observationHash: observationHash({ ...observation, price, observedAt }),
    source: {
      ...(observation.source || {}),
      validationState: 'validated',
      manualSourceCheckPassed: true,
      customerDisplayAllowed: review.customerDisplayAllowed === true,
      retentionAllowed: review.retentionAllowed === true,
      redistributionAllowed: review.redistributionAllowed === true,
      alertsEnabled: false
    }
  };
}

module.exports = {
  sameIdentity,
  observationHash,
  reviewProviderValidationRun,
  promoteValidatedObservation
};
