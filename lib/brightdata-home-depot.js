const { enforceUsageBudget, normalizeLiveObservation, redactSecrets } = require('./live-ingestion');

const HOME_DEPOT_DATASET_ID = 'gd_lmusivh019i7g97q2n';
const BRIGHTDATA_TRIGGER_URL = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${HOME_DEPOT_DATASET_ID}&format=json&uncompressed_webhook=true`;

function cleanUrl(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw new Error('valid Home Depot product URL is required');
  }
  if (!/(^|\.)homedepot\.com$/i.test(url.hostname)) throw new Error('Home Depot URL is required');
  return url.toString();
}

function normalizeZip(value) {
  if (value == null || value === '') return '';
  const zip = String(value).trim();
  if (!/^\d{5}$/.test(zip)) throw new Error('ZIP must be 5 digits');
  return zip;
}

function planHomeDepotTrigger({ products = [], monthToDateRecords = 0, budget } = {}) {
  const requestedRecords = Array.isArray(products) ? products.length : 0;
  const usage = enforceUsageBudget({ requestedRecords, monthToDateRecords, budget });
  if (!usage.allowedRecords) {
    return { usage, inputs: [], blocked: requestedRecords > 0 };
  }

  const inputs = products.slice(0, usage.allowedRecords).map((product) => ({
    url: cleanUrl(product?.url || product),
    zipcode: normalizeZip(product?.zip || product?.zipcode || '')
  }));

  return { usage, inputs, blocked: usage.blocked };
}

function buildHomeDepotTriggerRequest({ apiToken, products, monthToDateRecords = 0, budget } = {}) {
  if (!apiToken) throw new Error('BRIGHTDATA_API_TOKEN is required server-side');
  const plan = planHomeDepotTrigger({ products, monthToDateRecords, budget });
  if (!plan.inputs.length) return { ...plan, request: null };

  return {
    ...plan,
    request: {
      url: BRIGHTDATA_TRIGGER_URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plan.inputs)
    }
  };
}

function extractPrice(record = {}) {
  const candidates = [record.price, record.current_price, record.sale_price, record.final_price, record.retail_price];
  for (const value of candidates) {
    if (value == null || value === '') continue;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Number(String(value).replace(/[$,]/g, '').trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeHomeDepotRecords(records, { zip, storeId, observedAt, rightsClass = 'internal-only' } = {}) {
  if (!Array.isArray(records)) throw new Error('Bright Data records array is required');
  return records.map((record) => normalizeLiveObservation({
    ...record,
    price: extractPrice(record),
    timestamp: record.timestamp || observedAt,
    zipcode: record.zipcode || zip
  }, {
    retailer: 'home depot',
    provider: 'bright-data',
    datasetId: HOME_DEPOT_DATASET_ID,
    zip: record.zipcode || zip,
    storeId: record.store_id || storeId,
    channel: record.store_id || record.zipcode || zip || storeId ? 'local' : 'online',
    observedAt,
    rightsClass
  }));
}

function safeRequestLog(request) {
  if (!request) return null;
  return redactSecrets({
    url: request.url,
    method: request.method,
    headers: request.headers,
    bodyCount: (() => {
      try { return JSON.parse(request.body).length; } catch { return null; }
    })()
  });
}

async function triggerHomeDepotSnapshot({ apiToken, products, monthToDateRecords = 0, budget, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const plan = buildHomeDepotTriggerRequest({ apiToken, products, monthToDateRecords, budget });
  if (!plan.request) return { ok: false, blocked: true, usage: plan.usage, requestCount: 0 };

  const response = await fetchImpl(plan.request.url, {
    method: plan.request.method,
    headers: plan.request.headers,
    body: plan.request.body,
    redirect: 'error'
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Bright Data trigger failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const snapshotId = String(payload?.snapshot_id || payload?.snapshotId || '').trim();
  if (!snapshotId) throw new Error('Bright Data returned a malformed trigger response');

  return {
    ok: true,
    provider: 'bright-data',
    datasetId: HOME_DEPOT_DATASET_ID,
    snapshotId,
    requestCount: plan.inputs.length,
    blocked: plan.blocked,
    alertsEnabled: false,
    validationState: 'shadow-pending'
  };
}

module.exports = {
  HOME_DEPOT_DATASET_ID,
  BRIGHTDATA_TRIGGER_URL,
  planHomeDepotTrigger,
  buildHomeDepotTriggerRequest,
  normalizeHomeDepotRecords,
  triggerHomeDepotSnapshot,
  safeRequestLog,
  extractPrice
};
