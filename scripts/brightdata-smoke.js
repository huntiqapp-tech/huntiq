'use strict';

const { collectHomeDepotShadowSnapshot } = require('../lib/brightdata-home-depot');

(async () => {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  const url = process.env.BRIGHTDATA_TEST_URL;
  const zip = process.env.BRIGHTDATA_TEST_ZIP;
  if (!apiToken) throw new Error('BRIGHTDATA_API_TOKEN is not available in this server-side runtime');
  if (!url) throw new Error('BRIGHTDATA_TEST_URL is required for an explicit Home Depot smoke-test target');

  const result = await collectHomeDepotShadowSnapshot({
    apiToken,
    products: [{ url, zip }],
    budget: { maxPerRun: 1, maxPerMonth: 5000 },
    maxPolls: 6,
    pollDelayMs: 10000
  });

  const summary = {
    ok: result.ok,
    provider: result.provider,
    datasetId: result.datasetId,
    snapshotId: result.snapshotId,
    ready: Boolean(result.ready),
    requestCount: result.requestCount || 0,
    recordCount: result.recordCount || 0,
    observationCount: result.observationCount || 0,
    validationState: result.validationState,
    alertsEnabled: false,
    redistributable: false,
    historyPromotionAllowed: false,
    manualSourceCheckRequired: result.manualSourceCheckRequired !== false
  };
  console.log(JSON.stringify(summary, null, 2));
})().catch(error => {
  console.error(JSON.stringify({
    ok: false,
    name: error.name,
    status: error.status || null,
    message: error.message
  }));
  process.exitCode = 1;
});
