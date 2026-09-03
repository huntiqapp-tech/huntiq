'use strict';

const crypto = require('crypto');
const { classifyOpportunityData } = require('./pwa-data-state');

const SECRET_KEY = /(authorization|api[-_]?key|access[-_]?token|refresh[-_]?token|cookie|secret|password)/i;

function clean(value) {
  return value == null ? null : String(value).trim() || null;
}

function validIso(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
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
  if (batch.provider !== 'retailerapi') throw new Error('RetailerAPI batch required');
  if (batch.validationState !== 'validated') throw new Error('validated provider batch required');
  if (validation.authenticatedLookupPassed !== true) throw new Error('authenticated lookup validation required');
  if (validation.manualSourceCheckPassed !== true) throw new Error('manual source validation required');
  if (validation.customerDisplayAllowed !== true) throw new Error('customer display rights required');
  if (!validIso(validation.validatedAt)) throw new Error('validation timestamp required');
  if (!Array.isArray(batch.assessments)) throw new Error('evaluated assessments required');
  return true;
}

function publicSource(observation = {}) {
  const source = observation.source || {};
  return {
    provider: clean(source.provider || 'retailerapi'),
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
    clean(observation.productId || observation.product_id || observation.sku || observation.upc || observation.modelNumber || observation.model_number),
    clean(observation.storeId || observation.store_id || observation.zip || observation.zipcode || 'online'),
    validIso(observation.observedAt || observation.timestamp),
    Number(observation.price)
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function toCustomerOpportunity(assessment = {}, { asOf = new Date().toISOString(), enableAlerts = false } = {}) {
  const observation = assessment.observation || {};
  assertNoSecrets(assessment, 'assessment');
  if (!clean(observation.retailer)) throw new Error('retailer required');
  const productIdentity = clean(observation.productId || observation.product_id || observation.sku || observation.upc || observation.modelNumber || observation.model_number);
  if (!productIdentity) throw new Error('stable product identity required');
  if (!Number.isFinite(Number(observation.price)) || Number(observation.price) < 0) throw new Error('valid price required');
  const observedAt = validIso(observation.observedAt || observation.timestamp);
  if (!observedAt) throw new Error('valid observation timestamp required');
  const source = publicSource(observation);
  if (source.provider !== 'retailerapi') throw new Error('RetailerAPI observation required');
  if (!source.providerRecordId) throw new Error('provider record provenance required');
  if (source.redistributionAllowed !== true) throw new Error('customer display provenance not authorized');

  const opportunity = assessment.opportunity || {};
  const dataState = classifyOpportunityData({ dataOrigin: 'live', validationState: 'validated', observedAt, source }, { asOf });
  const decisionAlertEligible = opportunity.alertEligible === true || opportunity.alert?.alert === true || opportunity.evidence?.alertEligible === true;
  const priceHistory = (assessment.priceHistory || []).map(Number).filter(Number.isFinite);
  const completedSales = (assessment.completedSales || []).map(sale => ({
    status: clean(sale.status),
    price: Number(sale.price),
    shipping: Number(sale.shipping || 0),
    soldAt: validIso(sale.soldAt),
    matchScore: Number(sale.matchScore),
    sourceConfidence: Number(sale.sourceConfidence),
    evidenceClass: clean(sale.evidenceClass)
  })).filter(sale => ['sold','completed','fulfilled'].includes(sale.status) && Number.isFinite(sale.price) && sale.price >= 0 && sale.soldAt);
  const rawComps = assessment.comps || {};
  const comps = {
    d30: Number.isFinite(Number(rawComps.d30)) ? Number(rawComps.d30) : null,
    d60: Number.isFinite(Number(rawComps.d60)) ? Number(rawComps.d60) : null,
    d90: Number.isFinite(Number(rawComps.d90)) ? Number(rawComps.d90) : null,
    soldCount: completedSales.length,
    soldWindowDays: Number.isFinite(Number(rawComps.soldWindowDays)) ? Number(rawComps.soldWindowDays) : null,
    activeListingCount: Number.isFinite(Number(rawComps.activeListingCount)) ? Number(rawComps.activeListingCount) : null,
    currentAsks: (rawComps.currentAsks || []).map(Number).filter(Number.isFinite)
  };
  return {
    id: `retailerapi-${assessmentId(observation)}`,
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
    comps,
    completedSales,
    dataQuality: Number.isFinite(Number(assessment.dataQuality)) ? Number(assessment.dataQuality) : 0,
    availability: clean(observation.availability),
    source,
    customerAlertEligible: Boolean(enableAlerts && dataState.alertEligible && decisionAlertEligible)
  };
}

function buildCustomerLivePayload(batch, validation, options = {}) {
  assertReleaseValidation(batch, validation);
  assertNoSecrets({ ...batch, assessments: [] }, 'batch');
  const asOf = validIso(options.asOf) || new Date().toISOString();
  const opportunities = [];
  const rejected = [];
  for (const assessment of batch.assessments) {
    try {
      opportunities.push(toCustomerOpportunity(assessment, { asOf, enableAlerts: options.enableAlerts === true }));
    } catch (error) {
      rejected.push({
        providerRecordId: clean(assessment?.observation?.source?.providerRecordId),
        reason: String(error.message || error)
      });
    }
  }
  return {
    provider: 'retailerapi',
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
  toCustomerOpportunity,
  buildCustomerLivePayload
};
