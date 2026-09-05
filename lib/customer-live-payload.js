'use strict';

const crypto = require('crypto');
const { classifyOpportunityData } = require('./pwa-data-state');
const { assessLiveOpportunityReadiness } = require('./live-opportunity-readiness');

const SECRET_KEY = /(authorization|api[-_]?key|access[-_]?token|refresh[-_]?token|cookie|secret|password)/i;
const SUPPORTED_PROVIDERS = new Set(['retailerapi', 'bright-data']);

function clean(value) {
  return value == null ? null : String(value).trim() || null;
}

function normalizeProvider(value) {
  const provider = clean(value)?.toLowerCase();
  if (provider === 'brightdata') return 'bright-data';
  return provider;
}

function validIso(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function stableProductIdentity(value = {}) {
  return clean(value.productId || value.product_id || value.sku || value.upc || value.modelNumber || value.model_number);
}

function assertNoSecrets(value, path = 'payload') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key) && child != null && child !== '') {
      throw new Error(`secret-bearing field rejected at ${path}.${key}`);
    }
    assertNoSecrets(child, `${path}.${key}`);
  }
}

function assertReleaseValidation(batch = {}, validation = {}) {
  const provider = normalizeProvider(batch.provider);
  if (!SUPPORTED_PROVIDERS.has(provider)) throw new Error('supported provider batch required');
  if (batch.validationState !== 'validated') throw new Error('validated provider batch required');
  if (validation.authenticatedLookupPassed !== true) throw new Error('authenticated provider validation required');
  if (validation.manualSourceCheckPassed !== true) throw new Error('manual source validation required');
  if (validation.customerDisplayAllowed !== true) throw new Error('customer display rights required');
  if (!validIso(validation.validatedAt)) throw new Error('validation timestamp required');
  if (!Array.isArray(batch.assessments)) throw new Error('evaluated assessments required');
  return provider;
}

function publicSource(observation = {}) {
  const source = observation.source || {};
  return {
    provider: normalizeProvider(source.provider),
    providerRecordId: clean(source.providerRecordId),
    providerStatus: clean(source.providerStatus),
    retrievedAt: validIso(source.retrievedAt),
    validationState: 'validated',
    dataState: 'live',
    rightsClass: clean(source.rightsClass),
    retentionPolicy: clean(source.retentionPolicy),
    redistributionAllowed: source.redistributionAllowed === true
  };
}

function assessmentId(observation = {}) {
  const parts = [
    clean(observation.retailer),
    stableProductIdentity(observation),
    clean(observation.storeId || observation.store_id || observation.zip || observation.zipcode || 'online'),
    validIso(observation.observedAt || observation.timestamp),
    Number(observation.price)
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function sanitizeHistoryObservations(assessment = {}, observation = {}, provider = null) {
  const currentAt = Date.parse(observation.observedAt || observation.timestamp);
  const currentRetailer = clean(observation.retailer);
  const currentProductIdentity = stableProductIdentity(observation);
  const currentStore = clean(observation.storeId || observation.store_id || observation.zip || observation.zipcode || 'online');
  const currentChannel = clean(observation.channel) || 'online';
  const rows = assessment.priceHistoryObservations || assessment.historyObservations || [];
  if (!Array.isArray(rows) || !currentProductIdentity) return [];

  const seen = new Set();
  return rows.map(row => {
    const price = Number(row?.price);
    const observedAt = validIso(row?.observedAt || row?.timestamp);
    const rowRetailer = clean(row?.retailer) || currentRetailer;
    const rowProductIdentity = stableProductIdentity(row || {});
    const rowStore = clean(row?.storeId || row?.store_id || row?.zip || row?.zipcode || 'online');
    const rowChannel = clean(row?.channel) || currentChannel;
    const rowProvider = normalizeProvider(row?.source?.provider || provider);
    if (!Number.isFinite(price) || price < 0 || !observedAt) return null;
    if (!rowProductIdentity || rowProductIdentity !== currentProductIdentity) return null;
    if (Number.isFinite(currentAt) && Date.parse(observedAt) >= currentAt) return null;
    if (rowRetailer !== currentRetailer || rowStore !== currentStore || rowChannel !== currentChannel) return null;
    if (provider && rowProvider && rowProvider !== provider) return null;
    const key = `${rowProductIdentity}|${observedAt}|${price}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return {
      productId: rowProductIdentity,
      price,
      observedAt,
      retailer: rowRetailer,
      storeId: rowStore,
      channel: rowChannel,
      source: rowProvider || provider,
      verified: row?.verified === true
    };
  }).filter(Boolean).sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
}

function sanitizeCompletedSales(assessment = {}, observation = {}, { asOf = null } = {}) {
  const currentProductIdentity = stableProductIdentity(observation);
  const observationTime = Date.parse(observation.observedAt || observation.timestamp);
  const asOfTime = Date.parse(asOf);
  const evidenceCutoff = [observationTime, asOfTime].filter(Number.isFinite).reduce((min, value) => Math.min(min, value), Infinity);
  const rows = assessment.completedSales || [];
  if (!Array.isArray(rows) || !currentProductIdentity) return [];

  const seen = new Set();
  return rows.map(sale => {
    const productIdentity = stableProductIdentity(sale || {});
    const status = clean(sale?.status);
    const price = Number(sale?.price);
    const shipping = Number(sale?.shipping || 0);
    const soldAt = validIso(sale?.soldAt);
    const matchScore = Number(sale?.matchScore);
    const sourceConfidence = Number(sale?.sourceConfidence);
    if (!productIdentity || productIdentity !== currentProductIdentity) return null;
    if (!['sold', 'completed', 'fulfilled'].includes(status)) return null;
    if (!Number.isFinite(price) || price < 0 || !soldAt) return null;
    if (Number.isFinite(evidenceCutoff) && Date.parse(soldAt) >= evidenceCutoff) return null;
    const key = `${productIdentity}|${soldAt}|${price}|${shipping}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return {
      productId: productIdentity,
      status,
      price,
      shipping,
      soldAt,
      matchScore: Number.isFinite(matchScore) ? matchScore : null,
      sourceConfidence: Number.isFinite(sourceConfidence) ? sourceConfidence : null,
      evidenceClass: clean(sale?.evidenceClass)
    };
  }).filter(Boolean).sort((a, b) => Date.parse(b.soldAt) - Date.parse(a.soldAt));
}

function toCustomerOpportunity(assessment = {}, { asOf = new Date().toISOString(), enableAlerts = false, validation = {}, expectedProvider = null } = {}) {
  const observation = assessment.observation || {};
  assertNoSecrets(assessment, 'assessment');
  if (!clean(observation.retailer)) throw new Error('retailer required');
  const productIdentity = stableProductIdentity(observation);
  if (!productIdentity) throw new Error('stable product identity required');
  if (!Number.isFinite(Number(observation.price)) || Number(observation.price) < 0) throw new Error('valid price required');
  const observedAt = validIso(observation.observedAt || observation.timestamp);
  if (!observedAt) throw new Error('valid observation timestamp required');
  const source = publicSource(observation);
  const provider = normalizeProvider(expectedProvider || source.provider);
  if (!SUPPORTED_PROVIDERS.has(provider)) throw new Error('supported provider observation required');
  if (source.provider !== provider) throw new Error('provider provenance mismatch');
  if (!source.providerRecordId) throw new Error('provider record provenance required');
  if (source.redistributionAllowed !== true) throw new Error('customer display provenance not authorized');

  const opportunity = assessment.opportunity || {};
  const dataState = classifyOpportunityData({ dataOrigin: 'live', validationState: 'validated', observedAt, source }, { asOf });
  const decisionAlertEligible = opportunity.alertEligible === true || opportunity.alert?.alert === true || opportunity.evidence?.alertEligible === true;
  const priceHistoryObservations = sanitizeHistoryObservations(assessment, observation, provider);
  const priceHistory = priceHistoryObservations.map(row => row.price);
  const completedSales = sanitizeCompletedSales(assessment, observation, { asOf });
  const rawComps = assessment.comps || {};
  const compIdentityMatches = stableProductIdentity(rawComps) === productIdentity;
  const comps = {
    d30: compIdentityMatches && Number.isFinite(Number(rawComps.d30)) ? Number(rawComps.d30) : null,
    d60: compIdentityMatches && Number.isFinite(Number(rawComps.d60)) ? Number(rawComps.d60) : null,
    d90: compIdentityMatches && Number.isFinite(Number(rawComps.d90)) ? Number(rawComps.d90) : null,
    soldCount: completedSales.length,
    soldWindowDays: compIdentityMatches && Number.isFinite(Number(rawComps.soldWindowDays)) ? Number(rawComps.soldWindowDays) : null,
    activeListingCount: compIdentityMatches && Number.isFinite(Number(rawComps.activeListingCount)) ? Number(rawComps.activeListingCount) : null,
    currentAsks: compIdentityMatches ? (rawComps.currentAsks || []).map(Number).filter(Number.isFinite) : []
  };
  const historyEvidence = assessment.historyEvidence || {};
  const historyClaimedPromoted = historyEvidence.historyPromoted === true || assessment.historyPromotion?.historyEligible === true;
  const historyPromoted = historyClaimedPromoted && priceHistoryObservations.length > 0;
  const claimedPromotedCount = Number.isFinite(Number(historyEvidence.promotedCount)) ? Number(historyEvidence.promotedCount) : priceHistoryObservations.length;
  const promotedCount = historyPromoted ? Math.min(claimedPromotedCount, priceHistoryObservations.length) : 0;
  const economics = assessment.economics || opportunity.economics || {};
  const readiness = assessLiveOpportunityReadiness({
    providerValidation: {
      authenticatedLookupPassed: validation.authenticatedLookupPassed === true,
      manualSourceCheckPassed: validation.manualSourceCheckPassed === true,
      customerDisplayAllowed: validation.customerDisplayAllowed === true,
      redistributionAllowed: source.redistributionAllowed === true,
      historyPromoted
    },
    historyEvidence: {
      sampleCount: priceHistoryObservations.length,
      promotedCount,
      anomalyConfidence: historyEvidence.anomalyConfidence ?? opportunity.anomaly?.confidence
    },
    resaleEvidence: {
      soldCount: completedSales.length,
      resaleConfidence: assessment.resaleConfidence ?? opportunity.resale?.resaleConfidence
    },
    economics: {
      expectedProfit: economics.expectedProfit ?? economics.profit,
      roi: economics.roi,
      downsideProfit: economics.downsideProfit ?? opportunity.downsideEconomics?.profit,
      downsideRoi: economics.downsideRoi ?? opportunity.downsideEconomics?.roi
    },
    decision: { alertEligible: decisionAlertEligible }
  });
  return {
    id: `${provider}-${assessmentId(observation)}`,
    dataOrigin: 'live',
    validationState: 'validated',
    dataState: dataState.kind,
    observedAt,
    retailer: clean(observation.retailer),
    title: clean(observation.title) || 'Retail opportunity',
    sku: clean(observation.sku),
    productId: clean(observation.productId || observation.product_id),
    upc: clean(observation.upc),
    modelNumber: clean(observation.modelNumber || observation.model_number),
    storeId: clean(observation.storeId || observation.store_id),
    zip: clean(observation.zip || observation.zipcode),
    channel: clean(observation.channel) || 'online',
    price: Number(observation.price),
    referencePrice: Number.isFinite(Number(assessment.referencePrice || opportunity.anomaly?.baseline)) ? Number(assessment.referencePrice || opportunity.anomaly?.baseline) : null,
    priceHistory,
    priceHistoryObservations,
    comps,
    completedSales,
    dataQuality: Number.isFinite(Number(assessment.dataQuality)) ? Number(assessment.dataQuality) : 0,
    availability: clean(observation.availability),
    source,
    liveReadiness: readiness,
    customerAlertEligible: Boolean(enableAlerts && dataState.alertEligible && readiness.alertEligible)
  };
}

function buildCustomerLivePayload(batch, validation, options = {}) {
  const provider = assertReleaseValidation(batch, validation);
  assertNoSecrets({ ...batch, assessments: [] }, 'batch');
  const asOf = validIso(options.asOf) || new Date().toISOString();
  const opportunities = [];
  const rejected = [];
  for (const assessment of batch.assessments) {
    try {
      opportunities.push(toCustomerOpportunity(assessment, { asOf, enableAlerts: options.enableAlerts === true, validation, expectedProvider: provider }));
    } catch (error) {
      rejected.push({
        providerRecordId: clean(assessment?.observation?.source?.providerRecordId),
        reason: String(error.message || error)
      });
    }
  }
  return {
    provider,
    generatedAt: asOf,
    validatedAt: validIso(validation.validatedAt),
    dataState: 'customer-live',
    alertsEnabled: options.enableAlerts === true && opportunities.some(item => item.customerAlertEligible),
    opportunities,
    rejected
  };
}

module.exports = {
  assertNoSecrets,
  assertReleaseValidation,
  publicSource,
  sanitizeHistoryObservations,
  sanitizeCompletedSales,
  stableProductIdentity,
  toCustomerOpportunity,
  buildCustomerLivePayload
};
