'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const retailerFixture = require('./fixtures/retailerapi-product.json');
const { runIngestOnce } = require('../scripts/ingest-once');

function response(payload, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    headers: { get: () => null },
    json: async () => payload
  };
}

function tempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `huntiq-cli-${name}-`));
}

(async () => {
  const root = tempDir('success');
  const jobsPath = path.join(root, 'jobs.json');
  const storeDir = path.join(root, 'audit');
  const lockPath = path.join(root, 'ingest.lock');
  const secret = 'integration-secret-must-be-redacted';
  const freshFixture = JSON.parse(JSON.stringify(retailerFixture));
  const freshTimestamp = new Date().toISOString();
  freshFixture._freshness.refreshed_at = freshTimestamp;
  freshFixture.cross_retailer.walmart._freshness.refreshed_at = freshTimestamp;
  freshFixture.cross_retailer.homedepot._freshness.refreshed_at = freshTimestamp;
  fs.writeFileSync(jobsPath, JSON.stringify([
    { provider: 'retailerapi', identifier: '19667262713' }
  ]));

  const output = [];
  const errors = [];
  const exitCode = await runIngestOnce({
    argv: [
      '--mode=live',
      '--providers=retailerapi',
      `--jobs-file=${jobsPath}`,
      `--store-dir=${storeDir}`,
      `--lock-path=${lockPath}`
    ],
    env: { RETAILERAPI_KEY: secret },
    fetchImpl: async () => response(freshFixture),
    stdout: (value) => output.push(String(value)),
    stderr: (value) => errors.push(String(value))
  });

  assert.equal(exitCode, 0);
  assert.equal(errors.length, 0);
  const summary = JSON.parse(output.join('\n'));
  assert.equal(summary.ok, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.alertsEnabled, false);
  assert.equal(summary.historyPromotionAllowed, false);
  assert.ok(summary.acceptedCount > 0);
  assert.ok(!output.join('\n').includes(secret));

  const auditFiles = fs.readdirSync(storeDir).filter((name) => name.startsWith('ing_') && name.endsWith('.json'));
  assert.equal(auditFiles.length, 1);
  const audit = fs.readFileSync(path.join(storeDir, auditFiles[0]), 'utf8');
  const stored = JSON.parse(audit);
  assert.equal(stored.alertsEnabled, false);
  assert.equal(stored.historyPromotionAllowed, false);
  assert.equal(stored.redistributable, false);
  assert.ok(stored.observations.length > 0);
  assert.ok(!audit.includes(secret));

  const failedRoot = tempDir('failure');
  const failedJobsPath = path.join(failedRoot, 'jobs.json');
  const failedStoreDir = path.join(failedRoot, 'audit');
  fs.writeFileSync(failedJobsPath, JSON.stringify([
    { provider: 'retailerapi', identifier: '19667262713' }
  ]));
  const failedOutput = [];
  const failedExitCode = await runIngestOnce({
    argv: [
      '--mode=live',
      '--providers=retailerapi',
      `--jobs-file=${failedJobsPath}`,
      `--store-dir=${failedStoreDir}`,
      `--lock-path=${path.join(failedRoot, 'ingest.lock')}`
    ],
    env: { RETAILERAPI_KEY: secret },
    fetchImpl: async () => response({ error: 'provider unavailable' }, { ok: false, status: 503 }),
    stdout: (value) => failedOutput.push(String(value)),
    stderr: () => {}
  });

  assert.equal(failedExitCode, 1);
  const failedSummary = JSON.parse(failedOutput.join('\n'));
  assert.equal(failedSummary.ok, false);
  assert.equal(failedSummary.failClosed, true);
  assert.equal(failedSummary.alertsEnabled, false);
  const failedAudit = fs.readdirSync(failedStoreDir)
    .filter((name) => name.startsWith('ing_') && name.endsWith('.json'))
    .map((name) => fs.readFileSync(path.join(failedStoreDir, name), 'utf8'))
    .join('\n');
  assert.ok(failedAudit);
  assert.ok(!failedAudit.includes(secret));

  console.log('ingest-once CLI integration tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
