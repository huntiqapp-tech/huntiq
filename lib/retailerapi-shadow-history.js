'use strict';

const { buildHistoryIndex, evaluateLiveObservation, historyKey, toObservationRow } = require('./live-history');

function observationFingerprint(observation = {}) {
  return [
    historyKey(observation),
    observation.observedAt || observation.timestamp || '',
    Number(observation.price),
    observation.availability || ''
  ].join('|');
}

function assertShadowBatch(batch = {}) {
  if (batch.provider !== 'retailerapi') throw new Error('RetailerAPI batch required');
  if (batch.validationState !== 'shadow') throw new Error('shadow validation state required');
  if (batch.alertsEnabled !== false) throw new Error('shadow batch must hard-disable alerts');
  if (!Array.isArray(batch.observations)) throw new Error('batch observations are required');
  return batch;
}

function mergeShadowHistory(batch, existingObservations = []) {
  assertShadowBatch(batch);
  const merged = [];
  const seen = new Set();
  for (const observation of [...existingObservations, ...batch.observations]) {
    if (!observation || !Number.isFinite(Number(observation.price))) continue;
    const fingerprint = observationFingerprint(observation);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    merged.push(observation);
  }
  return merged;
}

function shadowAlertSuppression(observation, opportunity) {
  return {
    send: false,
    suppressed: true,
    reason: 'provider-shadow-validation',
    dataState: 'shadow-live',
    retailer: observation.retailer,
    productId: observation.productId || observation.product_id || observation.sku || null,
    decision: opportunity?.decision || opportunity?.recommendation || null
  };
}

function evaluateRetailerApiShadowBatch(batch, {
  existingObservations = [],
  comps = {},
  economics = {},
  referencePrices = {},
  dataQuality = 1,
  evidenceQuality = 1,
  confirmationScore = 100
} = {}) {
  assertShadowBatch(batch);
  const history = mergeShadowHistory(batch, existingObservations);
  const historyIndex = buildHistoryIndex(history);

  const assessments = batch.observations.map(observation => {
    const referencePrice = referencePrices[historyKey(observation)] ?? referencePrices[observation.retailer] ?? undefined;
    const opportunity = evaluateLiveObservation(observation, {
      historyIndex,
      comps,
      economics,
      referencePrice,
      dataQuality,
      evidenceQuality,
      confirmationScore
    });
    return {
      historyKey: historyKey(observation),
      observation,
      historyRow: toObservationRow(observation),
      opportunity,
      notification: shadowAlertSuppression(observation, opportunity),
      validationState: 'shadow',
      dataState: 'shadow-live'
    };
  });

  return {
    provider: 'retailerapi',
    validationState: 'shadow',
    alertsEnabled: false,
    dataState: 'shadow-live',
    historyObservationCount: history.length,
    acceptedObservationCount: batch.observations.length,
    rejectedObservationCount: Array.isArray(batch.rejected) ? batch.rejected.length : 0,
    assessments
  };
}

function shadowHistoryRows(batch) {
  assertShadowBatch(batch);
  return batch.observations.map(observation => ({
    ...toObservationRow(observation),
    validation_state: 'shadow',
    alert_eligible: false,
    provider_record_id: observation.source?.providerRecordId || null,
    provider_status: observation.source?.providerStatus || null,
    provider_retrieved_at: observation.source?.retrievedAt || batch.retrievedAt || null,
    retention_policy: observation.source?.retentionPolicy || batch.rawAudit?.retentionPolicy || 'unknown',
    redistribution_allowed: observation.source?.redistributionAllowed === true
  }));
}

module.exports = {
  observationFingerprint,
  assertShadowBatch,
  mergeShadowHistory,
  shadowAlertSuppression,
  evaluateRetailerApiShadowBatch,
  shadowHistoryRows
};
