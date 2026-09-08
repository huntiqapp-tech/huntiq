'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveSchedule, runScheduledIngestion } = require('../lib/ingestion-schedule');
const { acquireIngestionLock, releaseIngestionLock } = require('../lib/ingestion-lock');

const oneShot = resolveSchedule({});
assert.equal(oneShot.once, true);
assert.equal(oneShot.maxCycles, 1);
assert.equal(oneShot.intervalMs, 0);

const bounded = resolveSchedule({ once: false, intervalMs: 999999999, maxCycles: 99 });
assert.equal(bounded.maxCycles, 24);
assert.ok(bounded.intervalMs <= 60 * 60 * 1000);

(async () => {
  const lockDir = fs.mkdtempSync(path.join(os.tmpdir(), 'huntiq-sched-'));
  const scheduled = await runScheduledIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'dry-run',
    once: false,
    intervalMs: 5,
    maxCycles: 2,
    sleep: async () => {},
    lockPath: path.join(lockDir, 'sched.lock'),
    fetchImpl: async () => { throw new Error('schedule dry-run must not fetch'); }
  });
  assert.equal(scheduled.runCount, 2);
  assert.equal(scheduled.alertsEnabled, false);
  assert.ok(scheduled.runs.every((run) => run.requestCount === 0));

  const lockPath = path.join(lockDir, 'overlap.lock');
  acquireIngestionLock({ lockPath });
  const overlapped = await runScheduledIngestion({
    providers: ['upcitemdb'],
    jobs: [{ provider: 'upcitemdb', upc: '012345678905' }],
    mode: 'live',
    credentials: { upcitemdbUserKey: 'upc-secret-key' },
    env: { UPCITEMDB_USER_KEY: 'upc-secret-key' },
    lockPath,
    fetchImpl: async () => { throw new Error('scheduled overlap must not fetch'); }
  });
  assert.equal(overlapped.runs[0].overlapSkipped, true);
  assert.equal(overlapped.runCount, 1);
  releaseIngestionLock(lockPath);

  console.log('ingestion-schedule tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
