const { normalizeLiveObservation, redactSecrets } = require('./live-ingestion');

const DEFAULT_HEADERS = Object.freeze({
  Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.8',
  'User-Agent': 'HUNTIQ/0.1 (+https://gethuntiq.com; product-price research bot)'
});

const DEFAULT_POLICY = Object.freeze({
  maxResponseBytes: 2_000_000,
  timeoutMs: 12_000,
  rightsClass: 'internal-only'
});

function normalizeHost(value) {
  return String(value || '').trim().toLowerCase().replace(/^www\./, '');
}

function validateTargetUrl(value, { allowedHosts = [] } = {}) {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw new Error('valid absolute retailer URL is required');
  }

  if (url.protocol !== 'https:') throw new Error('retailer scraper requires HTTPS');
  if (url.username || url.password) throw new Error('credential-bearing URLs are not allowed');

  const host = normalizeHost(url.hostname);
  const allow = allowedHosts.map(normalizeHost).filter(Boolean);
  if (allow.length && !allow.some((entry) => host === entry || host.endsWith(`.${entry}`))) {
    throw new Error(`retailer host is not allowlisted: ${host}`);
  }

  url.hash = '';
  return url.toString();
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function collectJsonLd(html) {
  const scripts = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(String(html || '')))) {
    const raw = decodeHtmlEntities(match[1]).trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch {
      // Ignore malformed structured-data blocks; another valid block may exist.
    }
  }
  return scripts;
}

function flattenJsonLd(nodes) {
  const output = [];
  const visit = (node) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node !== 'object') return;
    output.push(node);
    if (Array.isArray(node['@graph'])) node['@graph'].forEach(visit);
  };
  nodes.forEach(visit);
  return output;
}

function typeIncludes(node, expected) {
  const types = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
  return types.some((value) => String(value || '').toLowerCase() === expected.toLowerCase());
}

function firstFinitePrice(...values) {
  for (const value of values.flat(Infinity)) {
    if (value == null || value === '') continue;
    const cleaned = typeof value === 'number' ? value : Number(String(value).replace(/[$,]/g, '').trim());
    if (Number.isFinite(cleaned) && cleaned >= 0) return Math.round(cleaned * 100) / 100;
  }
  return null;
}

function selectOffer(offers) {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  const normalized = list.filter((offer) => offer && typeof offer === 'object');
  if (!normalized.length) return null;

  return normalized
    .map((offer) => ({
      offer,
      price: firstFinitePrice(offer.price, offer.lowPrice, offer.highPrice)
    }))
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    })[0].offer;
}

function cleanAvailability(value) {
  if (!value) return null;
  const text = String(value);
  const slash = text.lastIndexOf('/');
  return (slash >= 0 ? text.slice(slash + 1) : text).replace(/([a-z])([A-Z])/g, '$1 $2').trim() || null;
}

function extractProductFromJsonLd(html) {
  const nodes = flattenJsonLd(collectJsonLd(html));
  const product = nodes.find((node) => typeIncludes(node, 'Product'));
  if (!product) return null;

  const offer = selectOffer(product.offers);
  const aggregate = product.offers && !Array.isArray(product.offers) && typeIncludes(product.offers, 'AggregateOffer')
    ? product.offers
    : null;
  const price = firstFinitePrice(offer?.price, aggregate?.lowPrice, aggregate?.highPrice);

  const identifier = product.sku || product.productID || product.mpn || product.gtin13 || product.gtin12 || product.gtin || null;
  if (!identifier || price == null) return null;

  return {
    sku: product.sku || identifier,
    product_id: product.productID || null,
    model_number: product.mpn || null,
    upc: product.gtin12 || product.gtin13 || product.gtin || null,
    title: product.name || null,
    price,
    currency: offer?.priceCurrency || aggregate?.priceCurrency || 'USD',
    availability: cleanAvailability(offer?.availability),
    sourceType: 'json-ld'
  };
}

function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta\\b[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(String(html || ''));
    if (match) return decodeHtmlEntities(match[1]).trim();
  }
  return null;
}

function extractProductFromMeta(html, { skuHint } = {}) {
  const price = firstFinitePrice(
    extractMeta(html, 'product:price:amount'),
    extractMeta(html, 'og:price:amount')
  );
  const identifier = skuHint || extractMeta(html, 'product:retailer_item_id') || extractMeta(html, 'sku');
  if (!identifier || price == null) return null;

  return {
    sku: identifier,
    title: extractMeta(html, 'og:title'),
    price,
    currency: extractMeta(html, 'product:price:currency') || extractMeta(html, 'og:price:currency') || 'USD',
    availability: cleanAvailability(extractMeta(html, 'product:availability')),
    sourceType: 'meta'
  };
}

function extractStructuredProduct(html, options = {}) {
  return extractProductFromJsonLd(html) || extractProductFromMeta(html, options);
}

function buildScrapeRequest({ url, allowedHosts = [], headers = {} } = {}) {
  const targetUrl = validateTargetUrl(url, { allowedHosts });
  return {
    url: targetUrl,
    method: 'GET',
    headers: { ...DEFAULT_HEADERS, ...headers }
  };
}

async function fetchHtml(request, { fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_POLICY.timeoutMs, maxResponseBytes = DEFAULT_POLICY.maxResponseBytes } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(request.url, {
      method: request.method || 'GET',
      headers: request.headers,
      redirect: 'follow',
      signal: controller.signal
    });

    if (!response || typeof response.text !== 'function') throw new Error('invalid scraper response');
    if (!response.ok) throw new Error(`retailer request failed with HTTP ${response.status}`);

    const contentType = String(response.headers?.get?.('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`unsupported retailer content type: ${contentType}`);
    }

    const declaredLength = Number(response.headers?.get?.('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > maxResponseBytes) {
      throw new Error('retailer response exceeds configured size limit');
    }

    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > maxResponseBytes) throw new Error('retailer response exceeds configured size limit');
    return html;
  } finally {
    clearTimeout(timer);
  }
}

async function scrapeRetailerProduct({
  retailer,
  url,
  allowedHosts,
  skuHint,
  zip,
  storeId,
  channel,
  observedAt,
  rightsClass = DEFAULT_POLICY.rightsClass,
  fetchImpl,
  headers,
  timeoutMs,
  maxResponseBytes
} = {}) {
  if (!retailer) throw new Error('retailer is required');
  const request = buildScrapeRequest({ url, allowedHosts, headers });
  const html = await fetchHtml(request, { fetchImpl, timeoutMs, maxResponseBytes });
  const product = extractStructuredProduct(html, { skuHint });
  if (!product) throw new Error('no supported public product price markup found');

  return normalizeLiveObservation({
    ...product,
    url: request.url,
    timestamp: observedAt
  }, {
    retailer,
    provider: 'huntiq-scraper',
    datasetId: product.sourceType,
    zip,
    storeId,
    channel,
    observedAt,
    rightsClass
  });
}

function safeScrapeRequestLog(request) {
  if (!request) return null;
  return redactSecrets({
    url: request.url,
    method: request.method,
    headers: request.headers
  });
}

module.exports = {
  DEFAULT_HEADERS,
  DEFAULT_POLICY,
  validateTargetUrl,
  collectJsonLd,
  extractProductFromJsonLd,
  extractProductFromMeta,
  extractStructuredProduct,
  buildScrapeRequest,
  fetchHtml,
  scrapeRetailerProduct,
  safeScrapeRequestLog,
  firstFinitePrice,
  cleanAvailability
};
