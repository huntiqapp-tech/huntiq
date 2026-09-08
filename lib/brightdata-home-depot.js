const { clampInt, enforceUsageBudget, normalizeLiveObservation, redactSecrets } = require('./live-ingestion');
const { fetchWithTimeout } = require('./ingestion-http');

const HARD_MAX_POLLS = 8;
const HARD_MAX_POLL_DELAY_MS = 15_000;
const DEFAULT_MAX_POLLS = 6;
const DEFAULT_TIMEOUT_MS = 12_000;

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

function resolvePollLimit(maxPolls) {
  return clampInt(maxPolls, { min: 1, max: HARD_MAX_POLLS, fallback: DEFAULT_MAX_POLLS });
}

function resolvePollDelayMs(pollDelayMs) {
  return clampInt(pollDelayMs, { min: 0, max: HARD_MAX_POLL_DELAY_MS, fallback: 0 });
}

function extractSnapshotId(payload, expectedId) {
  const raw = payload?.snapshot_id || payload?.snapshotId;
  if (!raw) throw new Error('Bright Data response snapshot identity is required');
  const id = normalizeSnapshotId(raw);
  if (expectedId) {
    const expected = normalizeSnapshotId(expectedId);
    if (id !== expected) throw new Error('Bright Data snapshot identity mismatch');
  }
  return id;
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

async function fetchJson(request, fetchImpl, label, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const response = await fetchWithTimeout(fetchImpl, request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'error'
  }, timeoutMs);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`${label} failed with ${response.status}`);
    error.status = response.status;
    error.code = response.status === 429 ? 'rate-limit' : 'provider-error';
    throw error;
  }
  if (payload == null) throw new Error(`${label} returned malformed JSON`);
  return payload;
}

async function triggerHomeDepotSnapshot({
  apiToken,
  products,
  monthToDateRecords = 0,
  budget,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const plan = buildHomeDepotTriggerRequest({ apiToken, products, monthToDateRecords, budget });
  if (!plan.request) return { ok: false, blocked: true, usage: plan.usage, requestCount: 0 };

  const payload = await fetchJson(plan.request, fetchImpl, 'Bright Data trigger', timeoutMs);
  let snapshotId;
  try {
    snapshotId = extractSnapshotId(payload);
  } catch {
    throw new Error('Bright Data returned a malformed trigger response');
  }

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

async function getSnapshotProgress({
  apiToken,
  snapshotId,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const request = buildSnapshotRequest({ apiToken, snapshotId, kind: 'progress' });
  const payload = await fetchJson(request, fetchImpl, 'Bright Data progress', timeoutMs);
  const resolvedId = extractSnapshotId(payload, snapshotId);
  const status = String(payload?.status || '').toLowerCase();
  if (!['starting', 'running', 'ready', 'failed'].includes(status)) {
    throw new Error('Bright Data returned an unknown snapshot status');
  }
  const errorMessage = payload.error_message == null ? null : String(payload.error_message);
  return {
    snapshotId: resolvedId,
    datasetId: String(payload.dataset_id || HOME_DEPOT_DATASET_ID),
    status,
    ready: status === 'ready',
    failed: status === 'failed',
    errorMessage,
    error: status === 'failed' ? (errorMessage || String(payload.error || 'snapshot failed')) : null
  };
}

async function downloadSnapshotRecords({
  apiToken,
  snapshotId,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const request = buildSnapshotRequest({ apiToken, snapshotId, kind: 'download' });
  const payload = await fetchJson(request, fetchImpl, 'Bright Data snapshot download', timeoutMs);
  if (!Array.isArray(payload)) throw new Error('Bright Data snapshot download must return a JSON array');
  return payload;
}

async function collectHomeDepotShadowSnapshot({
  apiToken,
  products,
  monthToDateRecords = 0,
  budget,
  fetchImpl = globalThis.fetch,
  maxPolls = DEFAULT_MAX_POLLS,
  pollDelayMs = 0,
  sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  observedAt,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  const pollLimit = resolvePollLimit(maxPolls);
  const delayMs = resolvePollDelayMs(pollDelayMs);
  const trigger = await triggerHomeDepotSnapshot({
    apiToken,
    products,
    monthToDateRecords,
    budget,
    fetchImpl,
    timeoutMs
  });
  if (!trigger.ok) return trigger;

  let progress = null;
  let polls = 0;
  while (polls < pollLimit) {
    polls += 1;
    progress = await getSnapshotProgress({
      apiToken,
      snapshotId: trigger.snapshotId,
      fetchImpl,
      timeoutMs
    });
    if (progress.status === 'failed') {
      return {
        ...trigger,
        ok: false,
        ready: false,
        failed: true,
        status: 'failed',
        pollCount: polls,
        errorMessage: progress.errorMessage,
        error: progress.error,
        validationState: 'shadow-failed',
        alertsEnabled: false,
        redistributable: false,
        historyPromotionAllowed: false
      };
    }
    if (progress.status === 'ready') break;
    if (progress.status === 'starting' || progress.status === 'running') {
      if (polls < pollLimit && delayMs > 0) await sleep(delayMs);
      continue;
    }
    throw new Error('Bright Data returned an unknown snapshot status');
  }

  if (!progress?.ready) {
    return {
      ...trigger,
      ok: true,
      ready: false,
      failed: false,
      status: progress?.status || 'running',
      pollCount: polls,
      validationState: 'shadow-running',
      alertsEnabled: false,
      redistributable: false,
      historyPromotionAllowed: false
    };
  }

  const records = await downloadSnapshotRecords({
    apiToken,
    snapshotId: trigger.snapshotId,
    fetchImpl,
    timeoutMs
  });
  const firstInput = Array.isArray(products) && products.length ? products[0] : {};
  const observations = normalizeHomeDepotRecords(records, {
    zip: firstInput?.zip || firstInput?.zipcode,
    observedAt,
    rightsClass: 'internal-only'
  });

  return {
    ...trigger,
    ready: true,
    failed: false,
    status: 'ready',
    pollCount: polls,
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
  extractPrice,
  extractSnapshotId,
  HARD_MAX_POLLS,
  DEFAULT_MAX_POLLS
};
