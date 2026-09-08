const crypto = require('crypto');

const DEFAULT_BUDGET = Object.freeze({ maxRecordsPerRun: 500, maxRecordsPerMonth: 5000 });
const INGESTION_AUTOMATION_BUDGET = Object.freeze({ maxRecordsPerRun: 25, maxRecordsPerMonth: 250 });
const SECRET_KEY_PATTERN = /(authorization|api[-_]?key|token|secret|password|user_key|bearer)/i;
const SOURCE_FAMILIES = Object.freeze({
  'bright-data': 'licensed-collection',
  retailerapi: 'aggregator-api',
  upcitemdb: 'identity-catalog',
  'huntiq-scraper': 'public-page',
  'huntiq-home-depot-scraper': 'public-page',
  'huntiq-retailer-scraper': 'public-page'
});

function cleanText(value) {
  return value == null ? null : String(value).trim() || null;
}

function finiteMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function finiteCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function sourceFamilyFor(provider) {
  return SOURCE_FAMILIES[cleanText(provider)?.toLowerCase()] || 'unknown';
}

function normalizeChannel(value, { storeId, zip } = {}) {
  const channel = cleanText(value)?.toLowerCase();
  if (channel === 'store') return 'local';
  if (channel === 'local' || channel === 'online') return channel;
  return storeId || zip ? 'local' : 'online';
}

function normalizeLiveObservation(raw = {}, context = {}) {
  const retailer = cleanText(context.retailer || raw.retailer)?.toLowerCase();
  const sku = cleanText(raw.sku || raw.product_id || raw.model_number || raw.upc);
  const price = finiteMoney(raw.price ?? raw.current_price ?? raw.sale_price ?? raw.currentPrice);
  const observedAt = cleanText(raw.timestamp || raw.observed_at || context.observedAt) || new Date().toISOString();
  const zip = cleanText(context.zip || raw.zipcode || raw.zip);
  const storeId = cleanText(context.storeId || raw.store_id || raw.storeId);
  const quantity = finiteCount(raw.quantity ?? raw.inventory ?? raw.inventoryCount ?? raw.stock);

  if (!retailer) throw new Error('retailer is required');
  if (!sku) throw new Error('product identity is required');
  if (price == null) throw new Error('valid non-negative price is required');
  if (!Number.isFinite(Date.parse(observedAt))) throw new Error('valid observation timestamp is required');

  return attachObservationAliases({
    retailer,
    sku,
    upc: cleanText(raw.upc),
    modelNumber: cleanText(raw.model_number || raw.modelNumber),
    productId: cleanText(raw.product_id || raw.productId),
    title: cleanText(raw.title || raw.name),
    price,
    currency: cleanText(raw.currency) || 'USD',
    availability: cleanText(raw.availability || raw.stock_status),
    quantity,
    storeId,
    zip,
    channel: normalizeChannel(context.channel || raw.channel, { storeId, zip }),
    observedAt: new Date(observedAt).toISOString(),
    source: {
      provider: cleanText(context.provider) || 'unknown',
      evidenceUrl: cleanText(raw.url || raw.product_url || raw.sourceUrl),
      datasetId: cleanText(context.datasetId),
      rightsClass: cleanText(context.rightsClass) || 'internal-only'
    }
  });
}

function attachObservationAliases(observation = {}) {
  const existingSource = observation.source;
  const source = existingSource && typeof existingSource === 'object'
    ? { ...existingSource }
    : {
      provider: cleanText(typeof existingSource === 'string' ? existingSource : observation.provider) || 'unknown',
      evidenceUrl: cleanText(observation.sourceUrl || observation.url),
      datasetId: cleanText(observation.datasetId),
      rightsClass: cleanText(observation.rightsClass) || 'internal-only'
    };
  const quantity = finiteCount(observation.quantity ?? observation.inventory ?? observation.inventoryCount);
  const zip = cleanText(observation.zip || observation.zipcode);
  const storeId = cleanText(observation.storeId || observation.store_id);
  const observedAt = cleanText(observation.observedAt || observation.timestamp);
  const provider = cleanText(source.provider || observation.provider) || 'unknown';
  const evidenceUrl = cleanText(source.evidenceUrl || observation.sourceUrl || observation.url);
  const channel = normalizeChannel(observation.channel, { storeId, zip });
  const family = cleanText(observation.sourceFamily || source.sourceFamily) || sourceFamilyFor(provider);
  source.provider = provider;
  source.evidenceUrl = evidenceUrl;
  source.sourceFamily = family;

  const next = {
    ...observation,
    quantity,
    inventory: quantity,
    inventoryCount: quantity,
    zip,
    zipcode: zip,
    storeId,
    store_id: storeId,
    productId: cleanText(observation.productId || observation.product_id),
    product_id: cleanText(observation.productId || observation.product_id),
    modelNumber: cleanText(observation.modelNumber || observation.model_number),
    model_number: cleanText(observation.modelNumber || observation.model_number),
    observedAt,
    timestamp: observedAt,
    channel,
    currentPrice: finiteMoney(observation.price ?? observation.currentPrice),
    provider,
    sourceFamily: family,
    sourceUrl: evidenceUrl,
    url: evidenceUrl,
    source
  };
  next.locationKey = locationKey(next);
  return next;
}

function toLegacyHistoryFields(observation = {}) {
  const row = attachObservationAliases(observation);
  return {
    retailer: row.retailer,
    sku: row.sku,
    storeId: row.storeId || (row.zip ? `zip:${row.zip}` : 'online'),
    price: row.price,
    inventory: row.quantity,
    observedAt: row.observedAt,
    source: row.provider,
    sourceFamily: row.sourceFamily,
    sourceUrl: row.sourceUrl,
    verified: false,
    evidenceQuality: row.evidenceQuality == null ? null : Number(row.evidenceQuality),
    confirmationScore: row.confirmationScore == null ? null : Number(row.confirmationScore)
  };
}

function toRightsContractFields(observation = {}) {
  const row = attachObservationAliases(observation);
  return {
    retailer: row.retailer,
    sku: row.sku,
    storeId: row.storeId || (row.channel === 'online' ? 'online' : row.zip ? `zip:${row.zip}` : null),
    currentPrice: row.price,
    observedAt: row.observedAt,
    source: row.provider,
    sourceFamily: row.sourceFamily,
    sourceUrl: row.sourceUrl,
    inventoryCount: row.quantity,
    provider: row.provider,
    providerRecordId: row.source.providerRecordId || null,
    retrievedAt: row.source.retrievedAt || row.observedAt,
    retentionPolicy: row.source.retentionPolicy || 'unknown',
    redistributionAllowed: false,
    verificationState: row.validationState || 'shadow',
    evidenceQuality: row.evidenceQuality == null ? 0 : Number(row.evidenceQuality)
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

function clampInt(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function observationFingerprint(observation = {}) {
  if (!observation?.retailer || !observation?.sku) throw new Error('normalized observation required');
  return [
    locationKey(observation),
    Number(observation.price),
    observation.availability || '',
    observation.observedAt || ''
  ].join('|');
}

function jobFingerprint(job = {}) {
  const provider = cleanText(job.provider)?.toLowerCase();
  if (!provider) throw new Error('job provider is required');
  const identity = cleanText(
    job.identifier
    || job.upc
    || job.url
    || job.productUrl
    || job.sku
    || job.productId
  );
  const zip = cleanText(job.zip || job.zipcode);
  const location = job.storeId ? `store:${cleanText(job.storeId)}` : zip ? `zip:${zip}` : 'online';
  return `${provider}|${identity || 'unknown'}|${location}|${cleanText(job.channel) || ''}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function redactSecrets(value, knownSecrets = []) {
  const secrets = (Array.isArray(knownSecrets) ? knownSecrets : [knownSecrets])
    .map((item) => (item == null ? '' : String(item)))
    .filter((item) => item.length >= 4);

  const scrub = (input) => {
    if (typeof input === 'string') {
      let text = input;
      text = text.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
      for (const secret of secrets) text = text.split(secret).join('[REDACTED]');
      return text;
    }
    if (Array.isArray(input)) return input.map(scrub);
    if (!input || typeof input !== 'object') return input;
    return Object.fromEntries(Object.entries(input).map(([key, val]) => (
      SECRET_KEY_PATTERN.test(key) ? [key, '[REDACTED]'] : [key, scrub(val)]
    )));
  };

  return scrub(value);
}

function sanitizeIngestionError(error, { knownSecrets = [], code, status } = {}) {
  const rawMessage = error && typeof error === 'object' ? error.message : error;
  const statusCode = status || error?.status || null;
  return redactSecrets({
    ok: false,
    code: code || error?.code || (statusCode === 429 ? 'rate-limit' : statusCode === 408 || error?.name === 'AbortError' ? 'timeout' : 'provider-error'),
    status: statusCode,
    retryAfterSeconds: Number.isFinite(Number(error?.retryAfterSeconds)) ? Number(error.retryAfterSeconds) : null,
    message: String(rawMessage || 'ingestion error')
  }, knownSecrets);
}

module.exports = {
  DEFAULT_BUDGET,
  INGESTION_AUTOMATION_BUDGET,
  SOURCE_FAMILIES,
  normalizeLiveObservation,
  locationKey,
  enforceUsageBudget,
  redactSecrets,
  clampInt,
  observationFingerprint,
  jobFingerprint,
  sha256,
  sanitizeIngestionError,
  sourceFamilyFor,
  normalizeChannel,
  attachObservationAliases,
  toLegacyHistoryFields,
  toRightsContractFields
};
