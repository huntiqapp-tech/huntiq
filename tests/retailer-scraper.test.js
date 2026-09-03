const assert = require('assert');
const {
  validateTargetUrl,
  extractStructuredProduct,
  buildScrapeRequest,
  scrapeRetailerProduct,
  safeScrapeRequestLog
} = require('../lib/retailer-scraper');
const { scrapeHomeDepotProduct } = require('../lib/home-depot-scraper');
const { runRetailerScrapeBatch } = require('../lib/retailer-scrape-batch');

assert.equal(
  validateTargetUrl('https://www.example.com/p/123#details', { allowedHosts: ['example.com'] }),
  'https://www.example.com/p/123'
);
assert.throws(() => validateTargetUrl('http://example.com/p/123', { allowedHosts: ['example.com'] }), /HTTPS/);
assert.throws(() => validateTargetUrl('https://evil.example.net/p/123', { allowedHosts: ['example.com'] }), /allowlisted/);
assert.throws(() => validateTargetUrl('https://user:pass@example.com/p/123', { allowedHosts: ['example.com'] }), /credential-bearing/);
assert.throws(() => validateTargetUrl('https://example.com/p/123'), /allowlist/);
assert.throws(() => validateTargetUrl('https://127.0.0.1/p/123', { allowedHosts: ['127.0.0.1'] }), /private, IP, localhost/);
assert.throws(() => validateTargetUrl('https://example.com/p/123?api_key=secret', { allowedHosts: ['example.com'] }), /credential-bearing query/);

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

const request = buildScrapeRequest({
  url: 'https://www.example.com/p/123',
  allowedHosts: ['example.com']
});
assert.throws(() => buildScrapeRequest({ url: 'https://example.com/p/123', allowedHosts: ['example.com'], headers: { Authorization: 'Bearer secret-token' } }), /credential-bearing scraper headers/);
const safeLog = safeScrapeRequestLog({ ...request, headers: { ...request.headers, Authorization: 'Bearer secret-token' } });
assert.equal(safeLog.headers.Authorization, '[REDACTED]');
assert.ok(!JSON.stringify(safeLog).includes('secret-token'));

(async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        if (String(name).toLowerCase() === 'content-type') return 'text/html; charset=utf-8';
        return null;
      }
    },
    async text() { return jsonLdHtml; }
  });

  const observation = await scrapeRetailerProduct({
    retailer: 'example retailer',
    url: 'https://www.example.com/p/123',
    allowedHosts: ['example.com'],
    zip: '18360',
    observedAt: '2026-09-03T08:00:00Z',
    asOf: '2026-09-03T08:05:00Z',
    fetchImpl
  });

  assert.equal(observation.retailer, 'example retailer');
  assert.equal(observation.sku, 'SKU-123');
  assert.equal(observation.price, 49.03);
  assert.equal(observation.zip, '18360');
  assert.equal(observation.channel, 'local');
  assert.equal(observation.source.provider, 'huntiq-scraper');
  assert.equal(observation.source.datasetId, 'json-ld');
  assert.equal(observation.source.rightsClass, 'public-page-internal-validation');
  assert.equal(observation.source.evidenceUrl, 'https://www.example.com/p/123');
  assert.equal(observation.source.retentionPolicy, 'ephemeral');
  assert.equal(observation.source.redistributionAllowed, false);
  assert.equal(observation.validationState, 'shadow');
  assert.equal(observation.alertEligible, false);

  await assert.rejects(() => scrapeRetailerProduct({
    retailer: 'example retailer',
    url: 'https://www.example.com/p/123',
    allowedHosts: ['example.com'],
    observedAt: '2026-09-03T06:00:00Z',
    asOf: '2026-09-03T08:05:00Z',
    fetchImpl
  }), /stale scraper observation/);

  const homeDepot = await scrapeHomeDepotProduct({
    url: 'https://www.homedepot.com/p/example/123',
    zip: '18360',
    observedAt: '2026-09-03T08:00:00Z',
    asOf: '2026-09-03T08:05:00Z',
    fetchImpl
  });
  assert.equal(homeDepot.retailer, 'home depot');
  assert.equal(homeDepot.channel, 'local');
  assert.equal(homeDepot.source.provider, 'huntiq-home-depot-scraper');
  assert.equal(homeDepot.source.redistributionAllowed, false);

  const batch = await runRetailerScrapeBatch([
    { retailer: 'home depot', url: 'https://www.homedepot.com/p/example/123', zip: '18360', observedAt: '2026-09-03T08:00:00Z' },
    { retailer: 'home depot', url: 'https://www.homedepot.com/p/example/123', zip: '18360', observedAt: '2026-09-03T08:00:00Z' },
    { retailer: 'unknown', url: 'https://example.com/p/123', observedAt: '2026-09-03T08:00:00Z' }
  ], { asOf: '2026-09-03T08:05:00Z', fetchImpl });
  assert.equal(batch.validationState, 'shadow');
  assert.equal(batch.alertsEnabled, false);
  assert.equal(batch.acceptedCount, 1, 'duplicate same-run observations must collapse');
  assert.equal(batch.rejectedCount, 1);
  assert.equal(batch.rejected[0].reason, 'unsupported-retailer-adapter');

  console.log('retailer-scraper tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
