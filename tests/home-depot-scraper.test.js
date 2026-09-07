const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  HOME_DEPOT_ALLOWED_HOSTS,
  extractHomeDepotSkuHint,
  validateHomeDepotProductUrl,
  normalizeHomeDepotZip,
  normalizeHomeDepotStoreId,
  scrapeHomeDepotProduct
} = require('../lib/scrapers/home-depot');
const { locationKey } = require('../lib/live-ingestion');
const { HOME_DEPOT_DATASET_ID } = require('../lib/brightdata-home-depot');

globalThis.fetch = async () => {
  throw new Error('live retailer fetches are forbidden in npm test');
};

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', 'home-depot', name), 'utf8');

function htmlResponse(html, { status = 200, url, contentType = 'text/html; charset=utf-8', contentLength, delayMs = 0, signal } = {}) {
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

assert.deepEqual(HOME_DEPOT_ALLOWED_HOSTS, ['homedepot.com']);
assert.equal(
  validateHomeDepotProductUrl('https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275#overview'),
  'https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275'
);
assert.equal(extractHomeDepotSkuHint('https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275'), '1007172275');
assert.equal(extractHomeDepotSkuHint('https://www.homedepot.com/p/item?itemId=319386960'), '319386960');
assert.equal(normalizeHomeDepotZip('18360'), '18360');
assert.equal(normalizeHomeDepotStoreId('4129'), '4129');

assert.throws(() => validateHomeDepotProductUrl('http://www.homedepot.com/p/1007172275'), /HTTPS/);
assert.throws(() => validateHomeDepotProductUrl('https://user:pass@www.homedepot.com/p/1007172275'), /credential-bearing/);
assert.throws(() => validateHomeDepotProductUrl('https://example.com/p/1007172275'), /allowlisted/);
assert.throws(() => validateHomeDepotProductUrl('https://www.homedepot.com/b/Tools/N-5yc1v'), /product URL/);
assert.throws(() => normalizeHomeDepotZip('1836'), /ZIP/);
assert.throws(() => normalizeHomeDepotStoreId('store 12'), /store id/);

(async () => {
  const jsonLd = fixture('product-jsonld.html');
  const fetchImpl = async (_url, init) => htmlResponse(jsonLd, { signal: init?.signal });
  const observedAt = '2026-09-07T18:00:00Z';
  const url = 'https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275';

  const local = await scrapeHomeDepotProduct({
    url,
    zip: '18360',
    observedAt,
    fetchImpl
  });

  assert.equal(local.retailer, 'home depot');
  assert.equal(local.sku, '1007172275');
  assert.equal(local.price, 49.03);
  assert.equal(local.zip, '18360');
  assert.equal(local.channel, 'local');
  assert.equal(local.source.provider, 'huntiq-scraper');
  assert.notEqual(local.source.provider, 'bright-data');
  assert.notEqual(local.source.datasetId, HOME_DEPOT_DATASET_ID);
  assert.equal(local.source.rightsClass, 'internal-only');
  assert.equal(local.source.validationState, 'shadow');
  assert.equal(local.source.experimental, true);
  assert.equal(local.source.retailerAdapter, 'home-depot');
  assert.equal(local.source.redistributionAllowed, false);
  assert.equal(local.source.evidenceUrl, url);

  const otherZip = await scrapeHomeDepotProduct({ url, zip: '18064', observedAt, fetchImpl });
  const store = await scrapeHomeDepotProduct({ url, storeId: '4129', observedAt, fetchImpl });
  const online = await scrapeHomeDepotProduct({ url, observedAt, fetchImpl });
  assert.equal(online.channel, 'online');
  assert.notEqual(locationKey(local), locationKey(otherZip), 'ZIP prices stay isolated');
  assert.notEqual(locationKey(local), locationKey(store), 'store and ZIP histories stay isolated');
  assert.notEqual(locationKey(store), locationKey(online), 'store and online histories stay isolated');

  const penny = await scrapeHomeDepotProduct({
    url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Penny/1000000001',
    observedAt,
    fetchImpl: async () => htmlResponse(fixture('product-penny.html'))
  });
  assert.equal(penny.price, 0.01);

  const meta = await scrapeHomeDepotProduct({
    url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Vac/206519277',
    skuHint: 'HD-FIXTURE-VAC',
    observedAt,
    fetchImpl: async () => htmlResponse(fixture('product-meta.html'))
  });
  assert.equal(meta.sku, 'HD-FIXTURE-VAC');
  assert.equal(meta.price, 19.95);
  assert.equal(meta.source.datasetId, 'meta');

  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      fetchImpl: async () => htmlResponse(fixture('missing-price.html'))
    }),
    /no supported public product price markup/
  );
  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      fetchImpl: async () => htmlResponse(fixture('malformed-price.html'))
    }),
    /no supported public product price markup/
  );
  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      fetchImpl: async () => htmlResponse(jsonLd, { status: 503 })
    }),
    /HTTP 503/
  );
  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      fetchImpl: async (_url, init) => htmlResponse(jsonLd, { delayMs: 40, signal: init?.signal }),
      timeoutMs: 5
    }),
    /timed out/
  );
  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      fetchImpl: async () => htmlResponse(jsonLd, { contentLength: 5000 }),
      maxResponseBytes: 100
    }),
    /size limit/
  );
  await assert.rejects(
    () => scrapeHomeDepotProduct({
      url,
      rightsClass: 'licensed-customer-display',
      fetchImpl
    }),
    /internal-only/
  );

  const secretFetch = async (requestUrl, init) => {
    assert.ok(!String(requestUrl).includes('super-secret'));
    assert.equal(init.headers.Authorization, 'Bearer secret-token');
    return htmlResponse(jsonLd, { signal: init.signal });
  };
  const secretObservation = await scrapeHomeDepotProduct({
    url: `${url}?api_key=super-secret`,
    observedAt,
    fetchImpl: secretFetch,
    headers: { Authorization: 'Bearer secret-token' }
  });
  assert.ok(!secretObservation.source.evidenceUrl.includes('super-secret'));

  console.log('home-depot-scraper tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
