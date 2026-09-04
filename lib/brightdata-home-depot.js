const { enforceUsageBudget, normalizeLiveObservation, redactSecrets } = require('./live-ingestion');

const HOME_DEPOT_DATASET_ID = 'gd_lmusivh019i7g97q2n';
const BRIGHTDATA_TRIGGER_URL = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${HOME_DEPOT_DATASET_ID}&format=json&uncompressed_webhook=true`;
const BRIGHTDATA_PROGRESS_URL = 'https://api.brightdata.com/datasets/v3/progress';
const BRIGHTDATA_SNAPSHOT_URL = 'https://api.brightdata.com/datasets/v3/snapshot';

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

function normalizeSnapshotId(value) {
  const id = String(value || '').trim();
  if (!/^s_[A-Za-z0-9_-]+$/.test(id) && !/^snapshot-[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error('valid Bright Data snapshot ID is required');
  }
  return id;
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

function buildSnapshotRequest({ apiToken, snapshotId, kind = 'progress' } = {}) {
  if (!apiToken) throw new Error('BRIGHTDATA_API_TOKEN is required server-side');
  const id = normalizeSnapshotId(snapshotId);
  if (!['progress', 'download'].includes(kind)) throw new Error('snapshot request kind must be progress or download');
  return {
    url: kind === 'progress'
      ? `${BRIGHTDATA_PROGRESS_URL}/${encodeURIComponent(id)}`
      : `${BRIGHTDATA_SNAPSHOT_URL}/${encodeURIComponent(id)}?format=json`,
    method: 'GET',
    headers: { Authorization: `Bearer ${apiToken}` }
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

async function fetchJson(request, fetchImpl, label) {
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'error'
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`${label} failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  if (payload == null) throw new Error(`${label} returned malformed JSON`);
  return payload;
}

async function triggerHomeDepotSnapshot({ apiToken, products, monthToDateRecords = 0, budget, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const plan = buildHomeDepotTriggerRequest({ apiToken, products, monthToDateRecords, budget });
  if (!plan.request) return { ok: false, blocked: true, usage: plan.usage, requestCount: 0 };

  const payload = await fetchJson(plan.request, fetchImpl, 'Bright Data trigger');
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

async function getSnapshotProgress({ apiToken, snapshotId, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const request = buildSnapshotRequest({ apiToken, snapshotId, kind: 'progress' });
  const payload = await fetchJson(request, fetchImpl, 'Bright Data progress');
  const status = String(payload?.status || '').toLowerCase();
  if (!['starting', 'running', 'ready', 'failed'].includes(status)) {
    throw new Error('Bright Data returned an unknown snapshot status');
  }
  return {
    snapshotId: String(payload.snapshot_id || snapshotId),
    datasetId: String(payload.dataset_id || HOME_DEPOT_DATASET_ID),
    status,
    ready: status === 'ready',
    failed: status === 'failed',
    error: status === 'failed' ? String(payload.error_message || payload.error || 'snapshot failed') : null
  };
}

async function downloadSnapshotRecords({ apiToken, snapshotId, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const request = buildSnapshotRequest({ apiToken, snapshotId, kind: 'download' });
  const payload = await fetchJson(request, fetchImpl, 'Bright Data snapshot download');
  if (!Array.isArray(payload)) throw new Error('Bright Data snapshot download must return a JSON array');
  return payload;
}

async function collectHomeDepotShadowSnapshot({
  apiToken,
  products,
  monthToDateRecords = 0,
  budget,
  fetchImpl = globalThis.fetch,
  maxPolls = 6,
  pollDelayMs = 0,
  sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  observedAt
} = {}) {
  const trigger = await triggerHomeDepotSnapshot({ apiToken, products, monthToDateRecords, budget, fetchImpl });
  if (!trigger.ok) return trigger;

  let progress = null;
  for (let attempt = 1; attempt <= maxPolls; attempt += 1) {
    progress = await getSnapshotProgress({ apiToken, snapshotId: trigger.snapshotId, fetchImpl });
    if (progress.failed) throw new Error(`Bright Data snapshot failed: ${progress.error}`);
    if (progress.ready) break;
    if (attempt < maxPolls && pollDelayMs > 0) await sleep(pollDelayMs);
  }

  if (!progress?.ready) {
    return {
      ...trigger,
      ready: false,
      validationState: 'shadow-running',
      alertsEnabled: false
    };
  }

  const records = await downloadSnapshotRecords({ apiToken, snapshotId: trigger.snapshotId, fetchImpl });
  const firstInput = Array.isArray(products) && products.length ? products[0] : {};
  const observations = normalizeHomeDepotRecords(records, {
    zip: firstInput?.zip || firstInput?.zipcode,
    observedAt,
    rightsClass: 'internal-only'
  });

  return {
    ...trigger,
    ready: true,
    validationState: 'shadow-review-required',
    recordCount: records.length,
    observationCount: observations.length,
    observations,
    alertsEnabled: false,
    redistributable: false,
    historyPromotionAllowed: false,
    manualSourceCheckRequired: true
  };
}

module.exports = {
  HOME_DEPOT_DATASET_ID,
  BRIGHTDATA_TRIGGER_URL,
  BRIGHTDATA_PROGRESS_URL,
  BRIGHTDATA_SNAPSHOT_URL,
  planHomeDepotTrigger,
  buildHomeDepotTriggerRequest,
  buildSnapshotRequest,
  normalizeHomeDepotRecords,
  triggerHomeDepotSnapshot,
  getSnapshotProgress,
  downloadSnapshotRecords,
  collectHomeDepotShadowSnapshot,
  safeRequestLog,
  extractPrice
};
