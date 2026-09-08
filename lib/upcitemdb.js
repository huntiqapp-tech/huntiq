'use strict';

const { redactSecrets, sanitizeIngestionError } = require('./live-ingestion');
const { fetchWithRetry, parseRetryAfterSeconds } = require('./ingestion-http');

const UPCITEMDB_TRIAL_URL = 'https://api.upcitemdb.com/prod/trial/lookup';
const UPCITEMDB_PAID_URL = 'https://api.upcitemdb.com/prod/v1/lookup';
const IDENTITY_FIELDS = Object.freeze([
  'ean', 'upc', 'gtin', 'title', 'brand', 'model', 'color', 'size', 'dimension', 'weight', 'category', 'description'
]);

class UpcItemDbError extends Error {
  constructor(message, { status, code, retryAfterSeconds } = {}) {
    super(message);
    this.name = 'UpcItemDbError';
    this.status = status || null;
    this.code = code || null;
    this.retryAfterSeconds = retryAfterSeconds || null;
  }
}

function cleanText(value) {
  return value == null ? null : String(value).trim() || null;
}

function normalizeUpc(value) {
  const upc = String(value || '').replace(/\D/g, '');
  if (!/^\d{8,14}$/.test(upc)) throw new Error('valid UPC/EAN/GTIN is required');
  return upc;
}

function buildUpcItemDbLookupRequest({ userKey, upc, useTrial = false } = {}) {
  const identifier = normalizeUpc(upc);
  if (useTrial) {
    const url = new URL(UPCITEMDB_TRIAL_URL);
    url.searchParams.set('upc', identifier);
    return {
      url: url.toString(),
      method: 'GET',
      headers: { Accept: 'application/json' },
      mode: 'trial'
    };
  }
  if (!cleanText(userKey)) throw new Error('UPCITEMDB_USER_KEY is required server-side');
  const url = new URL(UPCITEMDB_PAID_URL);
  url.searchParams.set('upc', identifier);
  return {
    url: url.toString(),
    method: 'GET',
    headers: {
      Accept: 'application/json',
      user_key: cleanText(userKey),
      key_type: '3scale'
    },
    mode: 'paid'
  };
}

function safeRequestLog(request = {}) {
  return redactSecrets({ url: request.url, method: request.method, headers: request.headers });
}

function pickIdentity(item = {}) {
  const identity = {};
  for (const field of IDENTITY_FIELDS) identity[field] = cleanText(item[field]);
  identity.ean = identity.ean || null;
  identity.upc = identity.upc || null;
  identity.title = identity.title || null;
  identity.brand = identity.brand || null;
  identity.model = identity.model || null;
  return identity;
}

function normalizeUpcItemDbPayload(payload, { retrievedAt, upc } = {}) {
  if (!payload || typeof payload !== 'object') throw new UpcItemDbError('UPCitemdb returned a malformed payload');
  const code = cleanText(payload.code)?.toUpperCase();
  if (code && code !== 'OK') {
    throw new UpcItemDbError(cleanText(payload.message) || `UPCitemdb returned ${code}`, { code });
  }
  if (!Array.isArray(payload.items)) throw new UpcItemDbError('UPCitemdb returned a malformed items array');

  return payload.items.map((item) => {
    const identity = pickIdentity(item);
    const stable = identity.upc || identity.ean || identity.gtin || upc;
    if (!stable || !identity.title) {
      return { ok: false, reason: 'malformed-identity', requestedUpc: upc };
    }
    return {
      ok: true,
      provider: 'upcitemdb',
      kind: 'product-identity',
      priceAuthority: false,
      retailerPriceVerification: false,
      validationState: 'shadow',
      alertsEnabled: false,
      retrievedAt,
      requestedUpc: upc,
      identity,
      source: {
        provider: 'upcitemdb',
        providerRecordId: stable,
        retrievedAt,
        rightsClass: 'internal-only',
        retentionPolicy: 'unknown',
        redistributionAllowed: false
      }
    };
  });
}

async function lookupUpcIdentity({
  userKey,
  upc,
  useTrial = false,
  fetchImpl = globalThis.fetch,
  timeoutMs,
  maxRetries,
  maxRetryDelayMs,
  sleep,
  retrievedAt = new Date().toISOString()
} = {}) {
  const request = buildUpcItemDbLookupRequest({ userKey, upc, useTrial });
  const knownSecrets = [userKey];
  const response = await fetchWithRetry(fetchImpl, request.url, {
    method: request.method,
    headers: request.headers
  }, { timeoutMs, maxRetries, maxRetryDelayMs, sleep, knownSecrets, retry: true });

  let body = null;
  try { body = await response.json(); } catch { body = null; }

  if (!response.ok) {
    const retryAfterSeconds = parseRetryAfterSeconds(response.headers, body);
    throw new UpcItemDbError(cleanText(body?.message) || `UPCitemdb request failed with ${response.status}`, {
      status: response.status,
      code: cleanText(body?.code) || (response.status === 429 ? 'rate-limit' : null),
      retryAfterSeconds
    });
  }

  const rows = normalizeUpcItemDbPayload(body, { retrievedAt, upc: normalizeUpc(upc) });
  const identities = rows.filter((row) => row.ok);
  const rejected = rows.filter((row) => !row.ok).map((row) => ({
    provider: 'upcitemdb',
    reason: row.reason,
    requestedUpc: row.requestedUpc
  }));

  return {
    provider: 'upcitemdb',
    validationState: 'shadow',
    alertsEnabled: false,
    retailerPriceVerification: false,
    priceAuthority: false,
    identities,
    rejected,
    requestLog: safeRequestLog(request)
  };
}

function sanitizeUpcItemDbError(error, knownSecrets = []) {
  return sanitizeIngestionError(error, { knownSecrets });
}

module.exports = {
  UPCITEMDB_TRIAL_URL,
  UPCITEMDB_PAID_URL,
  IDENTITY_FIELDS,
  UpcItemDbError,
  buildUpcItemDbLookupRequest,
  safeRequestLog,
  normalizeUpcItemDbPayload,
  lookupUpcIdentity,
  sanitizeUpcItemDbError
};
