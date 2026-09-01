const { evaluateOpportunity } = require('./engine');
const { shouldNotify } = require('./alerts');
const { locationKey } = require('./live-ingestion');
const Fulfillment = require('./fulfillment');
const QuantityEconomics = require('./quantity-economics');
const QuantityAlerts = require('./quantity-alerts');
const DealReadiness = require('./deal-readiness');

function productKey(o = {}) {
  const value = o.productId || o.product_id || o.sku || o.upc || o.modelNumber || o.model_number;
  if (!value) throw new Error('observation requires a stable product identifier');
  return String(value).trim();
}

function historyLocation(o = {}) {
  const storeId = o.storeId || o.store_id;
  const zip = o.zip || o.zipcode;
  if (storeId) return `store:${String(storeId).trim()}`;
  if (zip) return `zip:${String(zip).trim()}`;
  return 'online';
}

function historyKey(o = {}) {
  return [String(o.retailer || '').toLowerCase(), productKey(o), historyLocation(o)].join('|');
}

function buildHistoryIndex(observations = []) {
  const index = new Map();
  [...observations]
    .filter(o => o && Number.isFinite(Number(o.price)))
    .sort((a,b) => new Date(a.observedAt || a.timestamp || 0) - new Date(b.observedAt || b.timestamp || 0))
    .forEach(o => {
      const key = historyKey(o);
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(o);
    });
  return index;
}

function priorObservations(observation, index, limit = 90) {
  const at = new Date(observation.observedAt || observation.timestamp || Date.now()).getTime();
  return (index.get(historyKey(observation)) || [])
    .filter(o => o !== observation && new Date(o.observedAt || o.timestamp || 0).getTime() < at)
    .slice(-Math.max(1, Number(limit) || 90));
}

function priorPrices(observation, index, limit = 90) {
  return priorObservations(observation, index, limit)
    .map(o => Number(o.price))
    .filter(Number.isFinite);
}

function observationContext(observation = {}) {
  return {
    retailer: observation.retailer,
    sku: observation.sku,
    productId: observation.productId || observation.product_id,
    storeId: observation.storeId || observation.store_id || null,
    zip: observation.zip || observation.zipcode || null,
    channel: observation.channel || 'online',
    observedAt: observation.observedAt || observation.timestamp || null,
    availability: observation.availability || null,
    quantity: observation.quantity == null ? null : Number(observation.quantity)
  };
}

function inventorySourceType(observation = {}) {
  const source = observation.source || {};
  if (source.sourceType) return String(source.sourceType).toLowerCase();
  const provider = String(source.provider || observation.provider || '').toLowerCase();
  if (provider === 'bright-data') return 'retailer_page';
  if (provider.includes('retailer') || provider.includes('api')) return 'retailer_api';
  return 'unknown';
}

function liveInventoryAssessment(observation = {}, opportunity = {}, options = {}) {
  const quantity = observation.quantity == null ? null : Number(observation.quantity);
  const availability = String(observation.availability || '').toLowerCase();
  const inStock = quantity > 0 || ['in_stock','instock','available','limited_stock','limited'].includes(availability);
  return Fulfillment.assess({
    ...opportunity,
    inventory:{quantity,inStock,observedAt:observation.observedAt || observation.timestamp || null,sourceType:inventorySourceType(observation)},
    inventoryQuantity:quantity,
    inventoryObservedAt:observation.observedAt || observation.timestamp || null,
    inventorySourceType:inventorySourceType(observation),
    inStock
  }, options);
}

function evaluateLiveObservation(observation, { historyIndex, comps = {}, economics = {}, quantityOptions = {}, fulfillmentOptions = {}, referencePrice, dataQuality = 1, evidenceQuality = 1, confirmationScore = 100 } = {}) {
  if (!observation || !Number.isFinite(Number(observation.price))) throw new Error('valid live observation is required');
  const index = historyIndex || buildHistoryIndex([observation]);
  const priceHistory = priorPrices(observation, index);
  const context = observationContext(observation);
  const opportunity = evaluateOpportunity({
    ...context,
    price: Number(observation.price),
    priceHistory,
    referencePrice,
    comps,
    dataQuality,
    evidenceQuality,
    confirmationScore,
    ...economics
  });
  const fulfillment = liveInventoryAssessment(observation, opportunity, fulfillmentOptions);
  const quantityEconomics = QuantityEconomics.plan({
    quantity: context.quantity,
    unitEconomics: opportunity.economics,
    resale: opportunity.resale,
    fulfillmentConfidence: fulfillment.confidence,
    inventoryAgeHours: fulfillment.ageHours,
    inventoryStale: fulfillment.stale,
    ...quantityOptions
  });
  return {...opportunity, fulfillment, quantityEconomics};
}

function evaluateLiveAlert(observation, options = {}) {
  const opportunity = evaluateLiveObservation(observation, options);
  const historyIndex = options.historyIndex || buildHistoryIndex([observation]);
  const readiness = DealReadiness.evaluateDealReadiness({
    opportunity,
    history: priorObservations(observation, historyIndex),
    ...(options.readinessOptions || {})
  });
  const quantityDecision = QuantityAlerts.gate(opportunity.quantityEconomics, options.quantityAlertOptions || {});
  const quantityFingerprint = QuantityAlerts.fingerprint(opportunity.quantityEconomics, quantityDecision);
  const readinessFingerprint = `ready:${readiness.ready ? 1 : 0}:${readiness.readinessScore}:${readiness.reasons.slice().sort().join(',') || 'ok'}`;
  const previous = options.previousNotification || null;
  const previousForBase = previous && previous.baseFingerprint ? {...previous, fingerprint:previous.baseFingerprint} : previous;
  const notification = shouldNotify(opportunity, previousForBase, options.alertOptions || {});
  const baseFingerprint = notification.fingerprint || (notification.decision && notification.decision.alert ? require('./alerts').alertFingerprint(opportunity) : null);
  const fingerprint = baseFingerprint ? `${baseFingerprint}|${quantityFingerprint}|${readinessFingerprint}` : `${quantityFingerprint}|${readinessFingerprint}`;

  notification.baseFingerprint = baseFingerprint;
  notification.fingerprint = fingerprint;
  notification.quantityDecision = quantityDecision;
  notification.readiness = readiness;

  if (!readiness.ready) {
    notification.notify = false;
    notification.reason = 'deal-not-ready';
  } else if (quantityDecision.blocked) {
    notification.notify = false;
    notification.reason = 'quantity-gated';
  } else if (previous && notification.reason === 'duplicate-suppressed' && previous.fingerprint && previous.fingerprint !== fingerprint) {
    notification.notify = true;
    notification.reason = 'state-changed';
  }

  if (notification.decision && Number.isFinite(Number(notification.decision.priority))) {
    notification.decision.priority = Math.max(0, Number(notification.decision.priority) - Number(quantityDecision.priorityPenalty || 0));
  }

  return { opportunity, notification, quantityDecision, readiness, historyKey: historyKey(observation) };
}

function toObservationRow(o = {}) {
  const source = o.source || {};
  return {
    retailer: o.retailer,
    product_key: productKey(o),
    location_key: locationKey(o),
    sku: o.sku || null,
    product_id: o.productId || o.product_id || null,
    model_number: o.modelNumber || o.model_number || null,
    upc: o.upc || null,
    store_id: o.storeId || o.store_id || null,
    zipcode: o.zip || o.zipcode || null,
    channel: o.channel || 'online',
    price: Number(o.price),
    availability: o.availability || null,
    quantity: o.quantity == null ? null : Number(o.quantity),
    observed_at: o.observedAt || o.timestamp,
    provider: source.provider || o.provider || 'unknown',
    dataset_id: source.datasetId || null,
    rights_class: source.rightsClass || 'internal-only',
    source_url: o.url || null
  };
}

module.exports = { productKey, historyLocation, historyKey, buildHistoryIndex, priorObservations, priorPrices, observationContext, inventorySourceType, liveInventoryAssessment, evaluateLiveObservation, evaluateLiveAlert, toObservationRow };
