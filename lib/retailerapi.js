'use strict';

const crypto = require('crypto');
const { normalizeLiveObservation, locationKey, redactSecrets } = require('./live-ingestion');

const RETAILERAPI_BASE_URL = 'https://api.retailerapi.com/v1';
const DEFAULT_MAX_AGE_HOURS = 48;
const ACCEPTED_CELL_STATUSES = new Set(['ok']);

function cleanText(value) {
  return value == null ? null : String(value).trim() || null;
}

function asIso(value) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function inferRetailer(product = {}, fallback) {
  if (cleanText(fallback)) return cleanText(fallback).toLowerCase();
  if (cleanText(product.retailer)) return cleanText(product.retailer).toLowerCase();
  if (cleanText(product.walmart_url)) return 'walmart';
  return null;
}

function productIdentity(product = {}) {
  return cleanText(product.upc || product.gtin || product.ean || product.asin || product.item_id || product.model || product.mpn);
}

function productUrl(product = {}, retailer) {
  const direct = product[`${String(retailer || '').replace(/\s+/g, '_')}_url`] || product.url || product.product_url;
  if (cleanText(direct)) return cleanText(direct);
  const match = (Array.isArray(product.retailer_links) ? product.retailer_links : [])
    .find(link => cleanText(link?.retailer)?.toLowerCase() === String(retailer || '').toLowerCase());
  return cleanText(match?.url);
}

function buildProductLookupRequest({ apiKey, identifier, includeCrossRetailer = true, retailer, forceRefresh = false } = {}) {
  if (!cleanText(apiKey)) throw new Error('RETAILERAPI_KEY is required server-side');
  if (!cleanText(identifier)) throw new Error('RetailerAPI product identifier is required');
  if (forceRefresh && !cleanText(retailer)) throw new Error('forceRefresh requires a retailer slug');
  const url = new URL(`${RETAILERAPI_BASE_URL}/products/${encodeURIComponent(cleanText(identifier))}`);
  if (includeCrossRetailer) url.searchParams.set('include_cross_retailer', 'true');
  if (cleanText(retailer)) url.searchParams.set('retailer', cleanText(retailer).toLowerCase());
  if (forceRefresh) url.searchParams.set('force_refresh', 'true');
  return {
    url: url.toString(),
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
  };
}

function safeRequestLog(request = {}) {
  return redactSecrets({ url: request.url, method: request.method, headers: request.headers });
}

class RetailerApiError extends Error {
  constructor(message, { status, code, retryAfterSeconds } = {}) {
    super(message);
    this.name = 'RetailerApiError';
    this.status = status || null;
    this.code = code || null;
    this.retryAfterSeconds = retryAfterSeconds || null;
  }
}

async function lookupProduct({ apiKey, identifier, includeCrossRetailer = true, retailer, forceRefresh = false, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const request = buildProductLookupRequest({ apiKey, identifier, includeCrossRetailer, retailer, forceRefresh });
  const response = await fetchImpl(request.url, { method: request.method, headers: request.headers });
  let body = null;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) {
    const retryAfter = Number(response.headers?.get?.('retry-after') || body?.retry_after_seconds);
    throw new RetailerApiError(cleanText(body?.error) || `RetailerAPI request failed with ${response.status}`, {
      status: response.status,
      code: cleanText(body?.code),
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null
    });
  }
  if (!body || typeof body !== 'object' || !productIdentity(body)) throw new RetailerApiError('RetailerAPI returned a malformed product payload');
  return body;
}

function freshnessState(observedAt, { asOf, maxAgeHours = DEFAULT_MAX_AGE_HOURS } = {}) {
  const observed = Date.parse(observedAt);
  const now = Date.parse(asOf || new Date().toISOString());
  if (!Number.isFinite(observed)) return { ok: false, reason: 'missing-or-invalid-freshness' };
  const ageHours = (now - observed) / 36e5;
  if (ageHours < -5 / 60) return { ok: false, reason: 'future-observation' };
  if (ageHours > Math.max(0, Number(maxAgeHours) || 0)) return { ok: false, reason: 'stale-observation', ageHours: +ageHours.toFixed(2) };
  return { ok: true, ageHours: +Math.max(0, ageHours).toFixed(2) };
}

function normalizeOne(product, { retailer, price, inStock, url, observedAt, status = 'ok', retrievedAt, rightsClass } = {}) {
  const providerRecordId = productIdentity(product);
  const observation = normalizeLiveObservation({
    product_id: product.item_id || providerRecordId,
    upc: product.upc || product.gtin || product.ean,
    model_number: product.model || product.mpn,
    title: product.title,
    price,
    timestamp: observedAt,
    availability: inStock === true ? 'in stock' : inStock === false ? 'out of stock' : 'unknown',
    url
  }, {
    retailer,
    provider: 'retailerapi',
    channel: 'online',
    observedAt,
    rightsClass: rightsClass || 'internal-only'
  });
  observation.source.providerRecordId = providerRecordId;
  observation.source.providerStatus = status;
  observation.source.retrievedAt = retrievedAt;
  observation.source.retentionPolicy = 'unknown';
  observation.source.redistributionAllowed = false;
  return observation;
}

function normalizeRetailerApiProduct(product = {}, { retrievedAt = new Date().toISOString(), maxAgeHours = DEFAULT_MAX_AGE_HOURS, rightsClass = 'internal-only', retailer } = {}) {
  const accepted = [];
  const rejected = [];
  const identity = productIdentity(product);
  if (!identity) return { observations: [], rejected: [{ retailer: null, reason: 'missing-product-identity' }] };

  const topRetailer = inferRetailer(product, retailer);
  if (topRetailer && Number.isFinite(Number(product.current_price))) {
    const topObservedAt = asIso(product._freshness?.refreshed_at || retrievedAt);
    const freshness = freshnessState(topObservedAt, { asOf: retrievedAt, maxAgeHours });
    if (freshness.ok) accepted.push(normalizeOne(product, {
      retailer: topRetailer,
      price: Number(product.current_price),
      inStock: product.in_stock,
      url: productUrl(product, topRetailer),
      observedAt: topObservedAt,
      retrievedAt: asIso(retrievedAt),
      rightsClass
    }));
    else rejected.push({ retailer: topRetailer, reason: freshness.reason, ageHours: freshness.ageHours });
  }

  for (const [slug, cell] of Object.entries(product.cross_retailer || {})) {
    const status = cleanText(cell?.status)?.toLowerCase() || 'unknown';
    if (!ACCEPTED_CELL_STATUSES.has(status)) {
      rejected.push({ retailer: slug, reason: `provider-status-${status}` });
      continue;
    }
    if (!Number.isFinite(Number(cell?.price))) {
      rejected.push({ retailer: slug, reason: 'missing-or-invalid-price' });
      continue;
    }
    const observedAt = asIso(cell?._freshness?.refreshed_at);
    const freshness = freshnessState(observedAt, { asOf: retrievedAt, maxAgeHours });
    if (!freshness.ok) {
      rejected.push({ retailer: slug, reason: freshness.reason, ageHours: freshness.ageHours });
      continue;
    }
    accepted.push(normalizeOne(product, {
      retailer: cleanText(cell.retailer) || slug,
      price: Number(cell.price),
      inStock: cell.in_stock,
      url: cell.url,
      observedAt,
      status,
      retrievedAt: asIso(retrievedAt),
      rightsClass
    }));
  }
  return { observations: dedupeRetailerApiObservations(accepted), rejected };
}

function dedupeRetailerApiObservations(observations = []) {
  const unique = new Map();
  for (const observation of observations) {
    const key = [locationKey(observation), observation.observedAt, observation.price, observation.availability].join('|');
    if (!unique.has(key)) unique.set(key, observation);
  }
  return [...unique.values()];
}

function prepareRetailerApiIngestion(product, options = {}) {
  const retrievedAt = asIso(options.retrievedAt) || new Date().toISOString();
  const normalized = normalizeRetailerApiProduct(product, { ...options, retrievedAt });
  const rawHash = crypto.createHash('sha256').update(JSON.stringify(redactSecrets(product))).digest('hex');
  return {
    provider: 'retailerapi',
    validationState: 'shadow',
    alertsEnabled: false,
    retrievedAt,
    observations: normalized.observations,
    rejected: normalized.rejected,
    rawAudit: {
      providerRecordId: productIdentity(product),
      sha256: rawHash,
      tokensConsumed: Number.isFinite(Number(product?.tokens_consumed)) ? Number(product.tokens_consumed) : null,
      tokensRemaining: Number.isFinite(Number(product?.tokens_remaining)) ? Number(product.tokens_remaining) : null,
      retentionPolicy: 'unknown',
      redistributionAllowed: false
    }
  };
}

module.exports = {
  RETAILERAPI_BASE_URL,
  DEFAULT_MAX_AGE_HOURS,
  RetailerApiError,
  buildProductLookupRequest,
  safeRequestLog,
  lookupProduct,
  freshnessState,
  normalizeRetailerApiProduct,
  dedupeRetailerApiObservations,
  prepareRetailerApiIngestion
};
