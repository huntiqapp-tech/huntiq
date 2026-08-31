const DEFAULT_BUDGET = Object.freeze({ maxRecordsPerRun: 500, maxRecordsPerMonth: 5000 });

function cleanText(value) {
  return value == null ? null : String(value).trim() || null;
}

function finiteMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function normalizeLiveObservation(raw = {}, context = {}) {
  const retailer = cleanText(context.retailer || raw.retailer)?.toLowerCase();
  const sku = cleanText(raw.sku || raw.product_id || raw.model_number || raw.upc);
  const price = finiteMoney(raw.price ?? raw.current_price ?? raw.sale_price);
  const observedAt = cleanText(raw.timestamp || raw.observed_at || context.observedAt) || new Date().toISOString();
  const zip = cleanText(context.zip || raw.zipcode || raw.zip);
  const storeId = cleanText(context.storeId || raw.store_id || raw.storeId);

  if (!retailer) throw new Error('retailer is required');
  if (!sku) throw new Error('product identity is required');
  if (price == null) throw new Error('valid non-negative price is required');
  if (!Number.isFinite(Date.parse(observedAt))) throw new Error('valid observation timestamp is required');

  return {
    retailer,
    sku,
    upc: cleanText(raw.upc),
    modelNumber: cleanText(raw.model_number || raw.modelNumber),
    productId: cleanText(raw.product_id || raw.productId),
    title: cleanText(raw.title || raw.name),
    price,
    currency: cleanText(raw.currency) || 'USD',
    availability: cleanText(raw.availability || raw.stock_status),
    quantity: Number.isFinite(Number(raw.quantity)) ? Math.max(0, Math.floor(Number(raw.quantity))) : null,
    storeId,
    zip,
    channel: cleanText(context.channel || raw.channel) || (storeId || zip ? 'local' : 'online'),
    observedAt: new Date(observedAt).toISOString(),
    source: {
      provider: cleanText(context.provider) || 'unknown',
      evidenceUrl: cleanText(raw.url || raw.product_url),
      datasetId: cleanText(context.datasetId),
      rightsClass: cleanText(context.rightsClass) || 'internal-only'
    }
  };
}

function locationKey(observation) {
  if (!observation?.retailer || !observation?.sku) throw new Error('normalized observation required');
  const location = observation.storeId ? `store:${observation.storeId}` : observation.zip ? `zip:${observation.zip}` : 'online';
  return `${observation.retailer}|${observation.sku}|${observation.channel}|${location}`;
}

function enforceUsageBudget({ requestedRecords, monthToDateRecords = 0, budget = DEFAULT_BUDGET } = {}) {
  const requested = Math.max(0, Math.floor(Number(requestedRecords) || 0));
  const used = Math.max(0, Math.floor(Number(monthToDateRecords) || 0));
  const runLimit = Math.max(0, Math.floor(Number(budget.maxRecordsPerRun) || 0));
  const monthLimit = Math.max(0, Math.floor(Number(budget.maxRecordsPerMonth) || 0));
  const remaining = Math.max(0, monthLimit - used);
  const allowedRecords = Math.min(requested, runLimit, remaining);
  return { requestedRecords: requested, allowedRecords, remainingMonthlyRecords: remaining, blocked: requested > allowedRecords };
}

function redactSecrets(value) {
  const secretPattern = /(authorization|api[-_]?key|token|secret|password)/i;
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, secretPattern.test(key) ? '[REDACTED]' : redactSecrets(val)]));
}

module.exports = { DEFAULT_BUDGET, normalizeLiveObservation, locationKey, enforceUsageBudget, redactSecrets };
