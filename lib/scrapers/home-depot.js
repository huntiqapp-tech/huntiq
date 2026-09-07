const {
  DEFAULT_POLICY,
  scrapeRetailerProduct,
  validateTargetUrl
} = require('../retailer-scraper');

const HOME_DEPOT_ALLOWED_HOSTS = Object.freeze(['homedepot.com']);
const HOME_DEPOT_RETAILER = 'home depot';
const HOME_DEPOT_ADAPTER = 'home-depot';

function normalizeHomeDepotZip(value) {
  if (value == null || value === '') return null;
  const zip = String(value).trim();
  if (!/^\d{5}$/.test(zip)) throw new Error('ZIP must be 5 digits');
  return zip;
}

function normalizeHomeDepotStoreId(value) {
  if (value == null || value === '') return null;
  const storeId = String(value).trim();
  if (!/^[A-Za-z0-9]{1,12}$/.test(storeId)) throw new Error('Home Depot store id is invalid');
  return storeId;
}

function extractHomeDepotSkuHint(url) {
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    return null;
  }

  const queryHint = parsed.searchParams.get('itemId')
    || parsed.searchParams.get('sku')
    || parsed.searchParams.get('productId');
  if (queryHint && String(queryHint).trim()) return String(queryHint).trim();

  const parts = parsed.pathname.split('/').filter(Boolean);
  const productIndex = parts.findIndex((part) => part.toLowerCase() === 'p');
  if (productIndex < 0) return null;
  const last = parts[parts.length - 1];
  return /^\d{5,}$/.test(last) ? last : null;
}

function validateHomeDepotProductUrl(value) {
  const targetUrl = validateTargetUrl(value, { allowedHosts: HOME_DEPOT_ALLOWED_HOSTS });
  const parsed = new URL(targetUrl);
  if (!/^\/p\//i.test(parsed.pathname)) throw new Error('Home Depot product URL is required');
  return targetUrl;
}

function attachShadowProvenance(observation) {
  return {
    ...observation,
    source: {
      ...observation.source,
      provider: 'huntiq-scraper',
      rightsClass: 'internal-only',
      validationState: 'shadow',
      experimental: true,
      retailerAdapter: HOME_DEPOT_ADAPTER,
      redistributionAllowed: false,
      retentionPolicy: 'unknown'
    }
  };
}

async function scrapeHomeDepotProduct({
  url,
  zip,
  storeId,
  skuHint,
  observedAt,
  fetchImpl,
  headers,
  timeoutMs,
  maxResponseBytes,
  rightsClass = DEFAULT_POLICY.rightsClass
} = {}) {
  if (rightsClass && rightsClass !== 'internal-only') {
    throw new Error('Home Depot HTML scraper observations are internal-only');
  }

  const targetUrl = validateHomeDepotProductUrl(url);
  const normalizedZip = normalizeHomeDepotZip(zip);
  const normalizedStoreId = normalizeHomeDepotStoreId(storeId);
  const observation = await scrapeRetailerProduct({
    retailer: HOME_DEPOT_RETAILER,
    url: targetUrl,
    allowedHosts: HOME_DEPOT_ALLOWED_HOSTS,
    skuHint: skuHint || extractHomeDepotSkuHint(targetUrl),
    zip: normalizedZip,
    storeId: normalizedStoreId,
    channel: normalizedZip || normalizedStoreId ? 'local' : 'online',
    observedAt,
    rightsClass: 'internal-only',
    fetchImpl,
    headers,
    timeoutMs,
    maxResponseBytes
  });

  return attachShadowProvenance(observation);
}

module.exports = {
  HOME_DEPOT_ALLOWED_HOSTS,
  HOME_DEPOT_RETAILER,
  HOME_DEPOT_ADAPTER,
  normalizeHomeDepotZip,
  normalizeHomeDepotStoreId,
  extractHomeDepotSkuHint,
  validateHomeDepotProductUrl,
  attachShadowProvenance,
  scrapeHomeDepotProduct
};
