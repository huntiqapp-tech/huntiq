'use strict';

const { lookupProduct, prepareRetailerApiIngestion } = require('../lib/retailerapi');

(async () => {
  const apiKey = process.env.RETAILERAPI_KEY;
  const identifier = process.env.RETAILERAPI_TEST_IDENTIFIER || '19667262713';
  if (!apiKey) throw new Error('RETAILERAPI_KEY is not available in this server-side runtime');
  const product = await lookupProduct({ apiKey, identifier, includeCrossRetailer: true });
  const ingestion = prepareRetailerApiIngestion(product);
  console.log(JSON.stringify({
    ok: true,
    provider: ingestion.provider,
    providerRecordId: ingestion.rawAudit.providerRecordId,
    acceptedObservations: ingestion.observations.length,
    rejectedObservations: ingestion.rejected.length,
    tokensConsumed: ingestion.rawAudit.tokensConsumed,
    tokensRemaining: ingestion.rawAudit.tokensRemaining,
    validationState: ingestion.validationState,
    alertsEnabled: ingestion.alertsEnabled
  }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, name: error.name, status: error.status || null, code: error.code || null, message: error.message }));
  process.exitCode = 1;
});
