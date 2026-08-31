const { evaluateOpportunity } = require('./engine');
const { shouldNotify } = require('./alerts');
const { locationKey } = require('./live-ingestion');

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

function priorPrices(observation, index, limit = 90) {
  const at = new Date(observation.observedAt || observation.timestamp || Date.now()).getTime();
  return (index.get(historyKey(observation)) || [])
    .filter(o => o !== observation && new Date(o.observedAt || o.timestamp || 0).getTime() < at)
    .slice(-Math.max(1, Number(limit) || 90))
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

function evaluateLiveObservation(observation, { historyIndex, comps = {}, economics = {}, referencePrice, dataQuality = 1, evidenceQuality = 1, confirmationScore = 100 } = {}) {
  if (!observation || !Number.isFinite(Number(observation.price))) throw new Error('valid live observation is required');
  const index = historyIndex || buildHistoryIndex([observation]);
  const priceHistory = priorPrices(observation, index);
  const context = observationContext(observation);
  return evaluateOpportunity({
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
}

function evaluateLiveAlert(observation, options = {}) {
  const opportunity = evaluateLiveObservation(observation, options);
  const notification = shouldNotify(opportunity, options.previousNotification || null, options.alertOptions || {});
  return { opportunity, notification, historyKey: historyKey(observation) };
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

module.exports = { productKey, historyLocation, historyKey, buildHistoryIndex, priorPrices, observationContext, evaluateLiveObservation, evaluateLiveAlert, toObservationRow };
