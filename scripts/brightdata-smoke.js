'use strict';

const { triggerHomeDepotSnapshot } = require('../lib/brightdata-home-depot');

(async () => {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  const url = process.env.BRIGHTDATA_TEST_URL;
  const zip = process.env.BRIGHTDATA_TEST_ZIP;
  if (!apiToken) throw new Error('BRIGHTDATA_API_TOKEN is not available in this server-side runtime');
  if (!url) throw new Error('BRIGHTDATA_TEST_URL is required for an explicit Home Depot smoke-test target');

  const result = await triggerHomeDepotSnapshot({
    apiToken,
    products: [{ url, zip }],
    budget: { maxPerRun: 1, maxPerMonth: 5000 }
  });
  console.log(JSON.stringify(result, null, 2));
})().catch(error => {
  console.error(JSON.stringify({
    ok: false,
    name: error.name,
    status: error.status || null,
    message: error.message
  }));
  process.exitCode = 1;
});
