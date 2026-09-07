const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { locationKey } = require('../lib/live-ingestion');
const { runScrapeBatch, sanitizeScrapeSummary, resolveScrapeAdapter } = require('../lib/scrape-runner');
const { scrapeHomeDepotProduct } = require('../lib/scrapers/home-depot');

globalThis.fetch = async () => {
  throw new Error('live retailer fetches are forbidden in npm test');
};

const jsonLd = fs.readFileSync(path.join(__dirname, 'fixtures', 'home-depot', 'product-jsonld.html'), 'utf8');
const missingPrice = fs.readFileSync(path.join(__dirname, 'fixtures', 'home-depot', 'missing-price.html'), 'utf8');

function htmlResponse(html, { status = 200, signal, delayMs = 0 } = {}) {
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
        headers: {
          get(name) {
            return String(name).toLowerCase() === 'content-type' ? 'text/html' : null;
          }
        },
        async text() { return html; }
      });
    }
  });
}

assert.equal(resolveScrapeAdapter({ retailer: 'Home Depot' }), scrapeHomeDepotProduct);
assert.equal(resolveScrapeAdapter({ retailer: 'home-depot' }), scrapeHomeDepotProduct);
assert.throws(() => resolveScrapeAdapter({ retailer: 'lowes' }), /unsupported scraper retailer/);

(async () => {
  const requestedUrls = [];
  const fetchImpl = async (url, init) => {
    requestedUrls.push(url);
    if (String(url).includes('1000000002')) return htmlResponse(missingPrice, { signal: init?.signal });
    if (String(url).includes('timeout')) return htmlResponse(jsonLd, { delayMs: 40, signal: init?.signal });
    if (String(url).includes('deny')) return htmlResponse(jsonLd, { status: 403, signal: init?.signal });
    return htmlResponse(jsonLd, { signal: init?.signal });
  };

  const sleeps = [];
  const batch = await runScrapeBatch({
    targets: [
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275', zip: '18360' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275', zip: '18360' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Drill/1007172275', zip: '18064' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Missing/1000000002' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Timeout/1007172275timeout', zip: '19901' },
      { retailer: 'home depot', url: 'https://example.com/p/not-allowed' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Deny/1007172275deny' },
      { retailer: 'lowes', url: 'https://www.lowes.com/pd/example/123' },
      { retailer: 'home depot', url: 'https://www.homedepot.com/p/HUNTIQ-Fixture-Budget/1007172275', storeId: '4129' }
    ],
    fetchImpl,
    observedAt: '2026-09-07T18:00:00Z',
    timeoutMs: 5,
    minIntervalMs: 25,
    monthToDateRecords: 0,
    budget: { maxRecordsPerRun: 7, maxRecordsPerMonth: 5000 },
    sleepImpl: (ms) => { sleeps.push(ms); },
    headers: { Authorization: 'Bearer secret-token' }
  });

  assert.equal(batch.provider, 'huntiq-scraper');
  assert.equal(batch.validationState, 'shadow');
  assert.equal(batch.alertsEnabled, false);
  assert.equal(batch.dataState, 'shadow-live');
  assert.equal(batch.rightsClass, 'internal-only');
  assert.equal(batch.experimental, true);
  assert.equal(batch.observations.length, 2, 'accepted ZIP-isolated Home Depot observations only');
  assert.equal(batch.observations[0].source.provider, 'huntiq-scraper');
  assert.equal(batch.observations[0].source.rightsClass, 'internal-only');
  assert.notEqual(locationKey(batch.observations[0]), locationKey(batch.observations[1]));
  assert.ok(sleeps.includes(25), 'rate limit interval is applied between live scrape attempts');
  assert.ok(batch.rejected.some((row) => row.reason === 'duplicate-target'));
  assert.ok(batch.rejected.some((row) => /no supported public product price markup/.test(row.reason)));
  assert.ok(batch.rejected.some((row) => /timed out/.test(row.reason)));
  assert.ok(batch.rejected.some((row) => /allowlisted/.test(row.reason)));
  assert.ok(batch.rejected.some((row) => /HTTP 403/.test(row.reason)));
  assert.ok(batch.rejected.some((row) => /unsupported scraper retailer/.test(row.reason)));
  assert.ok(batch.rejected.some((row) => row.reason === 'usage-budget-exceeded'));
  assert.equal(batch.usage.allowedRecords, 7);
  assert.ok(requestedUrls.every((url) => /^https:\/\/www\.homedepot\.com\//.test(url)));
  assert.ok(!JSON.stringify(batch).includes('secret-token'));

  const summary = sanitizeScrapeSummary(batch);
  assert.equal(summary.alertsEnabled, false);
  assert.equal(summary.validationState, 'shadow');
  assert.equal(summary.acceptedObservations, 2);
  assert.ok(summary.rejectedObservations >= 6);
  assert.ok(!JSON.stringify(summary).includes('secret-token'));
  assert.ok(!JSON.stringify(summary).includes(jsonLd.slice(0, 40)));

  const empty = await runScrapeBatch({ targets: [], fetchImpl });
  assert.equal(empty.observations.length, 0);
  assert.equal(empty.alertsEnabled, false);

  console.log('scrape-runner tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
