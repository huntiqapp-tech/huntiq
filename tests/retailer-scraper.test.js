const assert = require('assert');
const {
  validateTargetUrl,
  extractStructuredProduct,
  buildScrapeRequest,
  scrapeRetailerProduct,
  safeScrapeRequestLog
} = require('../lib/retailer-scraper');
const { locationKey } = require('../lib/live-ingestion');

globalThis.fetch = async () => {
  throw new Error('live retailer fetches are forbidden in npm test');
};

function htmlResponse(html, {
  status = 200,
  url,
  contentType = 'text/html; charset=utf-8',
  contentLength,
  delayMs = 0,
  signal
} = {}) {
  return new Promise((resolve, reject) => {
    const timer = delayMs ? setTimeout(finish, delayMs) : null;
    const abort = () => {
      if (timer) clearTimeout(timer);
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    };
    if (signal) {
      if (signal.aborted) return abort();
      signal.addEventListener('abort', abort, { once: true });
    }
    if (!delayMs) finish();

    function finish() {
      resolve({
        ok: status >= 200 && status < 300,
        status,
        url,
        headers: {
          get(name) {
            const key = String(name).toLowerCase();
            if (key === 'content-type') return contentType;
            if (key === 'content-length') return contentLength == null ? null : String(contentLength);
            return null;
          }
        },
        async text() { return html; }
      });
    }
  });
}

assert.equal(
  validateTargetUrl('https://www.example.com/p/123#details', { allowedHosts: ['example.com'] }),
  'https://www.example.com/p/123'
);
assert.equal(
  validateTargetUrl('https://www.example.com/p/123?itemId=123&api_key=super-secret', { allowedHosts: ['example.com'] }),
  'https://www.example.com/p/123?itemId=123'
);
assert.throws(() => validateTargetUrl('http://example.com/p/123', { allowedHosts: ['example.com'] }), /HTTPS/);
assert.throws(() => validateTargetUrl('https://evil.example.net/p/123', { allowedHosts: ['example.com'] }), /allowlisted/);
assert.throws(() => validateTargetUrl('https://example.com.evil.net/p/123', { allowedHosts: ['example.com'] }), /allowlisted/);
assert.throws(() => validateTargetUrl('https://user:pass@example.com/p/123', { allowedHosts: ['example.com'] }), /credential-bearing/);

const jsonLdHtml = `<!doctype html><html><head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Cordless Drill Kit",
  "sku": "SKU-123",
  "mpn": "MODEL-9",
  "gtin12": "012345678905",
  "offers": {
    "@type": "Offer",
    "price": "49.03",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
</script></head></html>`;

const parsed = extractStructuredProduct(jsonLdHtml);
assert.equal(parsed.sku, 'SKU-123');
assert.equal(parsed.price, 49.03);
assert.equal(parsed.title, 'Cordless Drill Kit');
assert.equal(parsed.availability, 'In Stock');
assert.equal(parsed.sourceType, 'json-ld');

const graphHtml = `
<script type='application/ld+json'>
{"@context":"https://schema.org","@graph":[{"@type":"BreadcrumbList","itemListElement":[]},{"@type":"Product","productID":"PID-55","name":"Saw","offers":[{"@type":"Offer","price":"129.99","priceCurrency":"USD"}]}]}
</script>`;
assert.equal(extractStructuredProduct(graphHtml).sku, 'PID-55');
assert.equal(extractStructuredProduct(graphHtml).price, 129.99);

const metaHtml = `
<meta property="og:title" content="Widget Pro">
<meta property="product:price:amount" content="$19.95">
<meta property="product:price:currency" content="USD">
<meta property="product:availability" content="in stock">`;
const metaParsed = extractStructuredProduct(metaHtml, { skuHint: 'WIDGET-1' });
assert.equal(metaParsed.sku, 'WIDGET-1');
assert.equal(metaParsed.price, 19.95);
assert.equal(metaParsed.sourceType, 'meta');

assert.equal(extractStructuredProduct(`<script type="application/ld+json">{"@type":"Product","sku":"SKU-0","offers":{"price":"0.01"}}</script>`).price, 0.01);
assert.equal(extractStructuredProduct(`<script type="application/ld+json">{"@type":"Product","sku":"SKU-X","offers":{"priceCurrency":"USD"}}</script>`), null);
assert.equal(extractStructuredProduct(`<script type="application/ld+json">{"@type":"Product","sku":"SKU-X","offers":{"price":"see cart"}}</script>`), null);

const request = buildScrapeRequest({
  url: 'https://www.example.com/p/123',
  allowedHosts: ['example.com'],
  headers: { Authorization: 'Bearer secret-token' }
});
const safeLog = safeScrapeRequestLog(request);
assert.equal(safeLog.headers.Authorization, '[REDACTED]');
assert.ok(!JSON.stringify(safeLog).includes('secret-token'));

(async () => {
  const fetchImpl = async (_url, init) => htmlResponse(jsonLdHtml, { signal: init?.signal });

  const observation = await scrapeRetailerProduct({
    retailer: 'example retailer',
    url: 'https://www.example.com/p/123',
    allowedHosts: ['example.com'],
    zip: '18360',
    observedAt: '2026-09-03T08:00:00Z',
    fetchImpl
  });

  assert.equal(observation.retailer, 'example retailer');
  assert.equal(observation.sku, 'SKU-123');
  assert.equal(observation.price, 49.03);
  assert.equal(observation.zip, '18360');
  assert.equal(observation.channel, 'local');
  assert.equal(observation.source.provider, 'huntiq-scraper');
  assert.equal(observation.source.datasetId, 'json-ld');
  assert.equal(observation.source.rightsClass, 'internal-only');
  assert.equal(observation.source.evidenceUrl, 'https://www.example.com/p/123');

  const storeObservation = await scrapeRetailerProduct({
    retailer: 'example retailer',
    url: 'https://www.example.com/p/123',
    allowedHosts: ['example.com'],
    storeId: '4129',
    observedAt: '2026-09-03T08:00:00Z',
    fetchImpl
  });
  const otherZip = await scrapeRetailerProduct({
    retailer: 'example retailer',
    url: 'https://www.example.com/p/123',
    allowedHosts: ['example.com'],
    zip: '18064',
    observedAt: '2026-09-03T08:00:00Z',
    fetchImpl
  });
  assert.notEqual(locationKey(observation), locationKey(otherZip));
  assert.notEqual(locationKey(observation), locationKey(storeObservation));

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse('<html></html>', { status: 403 })
    }),
    /HTTP 403/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async (_url, init) => htmlResponse(jsonLdHtml, { delayMs: 50, signal: init?.signal }),
      timeoutMs: 5
    }),
    /timed out after 5ms/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse(jsonLdHtml, { contentLength: 9_999_999 }),
      maxResponseBytes: 100
    }),
    /size limit/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse('x'.repeat(200), { contentType: 'text/html' }),
      maxResponseBytes: 50
    }),
    /size limit/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse(jsonLdHtml, { contentType: 'application/json' })
    }),
    /content type/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse(jsonLdHtml, { url: 'https://evil.example.net/phish' })
    }),
    /allowlisted/
  );

  await assert.rejects(
    () => scrapeRetailerProduct({
      retailer: 'example retailer',
      url: 'https://www.example.com/p/123',
      allowedHosts: ['example.com'],
      fetchImpl: async () => htmlResponse('<html><body>no product markup</body></html>')
    }),
    /no supported public product price markup/
  );

  console.log('retailer-scraper tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
