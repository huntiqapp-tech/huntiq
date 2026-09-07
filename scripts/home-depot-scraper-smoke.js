'use strict';

const { runScrapeBatch, sanitizeScrapeSummary } = require('../lib/scrape-runner');

function fail(message) {
  console.error(JSON.stringify({ ok: false, message }));
  process.exitCode = 1;
}

(async () => {
  const url = process.env.HOME_DEPOT_SMOKE_URL;
  if (!url) {
    throw new Error('HOME_DEPOT_SMOKE_URL is required in this server-side runtime');
  }

  const batch = await runScrapeBatch({
    targets: [{
      retailer: 'home depot',
      url,
      zip: process.env.HOME_DEPOT_SMOKE_ZIP || undefined,
      storeId: process.env.HOME_DEPOT_SMOKE_STORE_ID || undefined
    }],
    fetchImpl: globalThis.fetch,
    minIntervalMs: 0
  });

  const summary = sanitizeScrapeSummary(batch);
  console.log(JSON.stringify({
    ...summary,
    skuPresent: Boolean(batch.observations[0]?.sku),
    pricePresent: Number.isFinite(Number(batch.observations[0]?.price)),
    channel: batch.observations[0]?.channel || null,
    zipPresent: Boolean(batch.observations[0]?.zip),
    storeIdPresent: Boolean(batch.observations[0]?.storeId),
    evidenceHost: (() => {
      try {
        return batch.observations[0]?.source?.evidenceUrl
          ? new URL(batch.observations[0].source.evidenceUrl).hostname
          : null;
      } catch {
        return null;
      }
    })()
  }, null, 2));
})().catch((error) => {
  fail(error.message);
});
