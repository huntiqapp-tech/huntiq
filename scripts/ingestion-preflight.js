'use strict';

const { reportIngestionPreflight } = require('../lib/ingestion-preflight');

const report = reportIngestionPreflight({
  env: process.env,
  providers: process.env.INGEST_PROVIDERS,
  mode: process.env.INGEST_MODE
});

console.log(JSON.stringify({
  mode: report.mode,
  providers: report.providers,
  liveReady: report.liveReady,
  failClosed: report.failClosed,
  configuredNames: report.configuredNames,
  missingNames: report.missingNames,
  missingRequiredNames: report.missingRequiredNames,
  unknownProviders: report.unknownProviders,
  secrets: report.secrets.map((item) => ({
    name: item.name,
    configured: item.configured,
    requiredForLive: item.requiredForLive,
    providers: item.providers
  }))
}, null, 2));

if (report.failClosed) process.exitCode = 1;
