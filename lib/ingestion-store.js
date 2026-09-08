'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { observationFingerprint, redactSecrets, sha256 } = require('./live-ingestion');

function defaultStoreDir() {
  return path.join(os.tmpdir(), 'huntiq-ingestion', 'shadow-store');
}

function createIngestionStore({ directory = defaultStoreDir(), knownSecrets = [] } = {}) {
  const root = path.resolve(directory);
  fs.mkdirSync(root, { recursive: true });

  function runPath(runId) {
    return path.join(root, `${String(runId).replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
  }

  function indexPath() {
    return path.join(root, 'job-index.json');
  }

  function readIndex() {
    try {
      return JSON.parse(fs.readFileSync(indexPath(), 'utf8'));
    } catch {
      return {};
    }
  }

  function writeIndex(index) {
    fs.writeFileSync(indexPath(), JSON.stringify(index, null, 2));
  }

  function lookupJob(fingerprint) {
    const index = readIndex();
    return index[fingerprint] || null;
  }

  function rememberJob(fingerprint, meta) {
    const index = readIndex();
    index[fingerprint] = {
      fingerprint,
      runId: meta.runId,
      provider: meta.provider,
      storedAt: meta.storedAt || new Date().toISOString(),
      observationCount: meta.observationCount || 0
    };
    writeIndex(index);
  }

  function saveRun(result) {
    const safe = redactSecrets({
      ...result,
      alertsEnabled: false,
      historyPromotionAllowed: false,
      redistributable: false,
      validationState: result.validationState || 'shadow'
    }, knownSecrets);
    const id = safe.runId || sha256(JSON.stringify({ at: safe.completedAt, providers: safe.providers }));
    fs.writeFileSync(runPath(id), JSON.stringify(safe, null, 2));
    const seen = new Set();
    for (const observation of safe.observations || []) {
      try {
        seen.add(observationFingerprint(observation));
      } catch {
        // skip malformed stored rows
      }
    }
    for (const job of safe.processedJobs || []) {
      if (job?.fingerprint && safe.mode === 'live' && !job.dryRun) rememberJob(job.fingerprint, {
        runId: id,
        provider: job.provider,
        storedAt: safe.completedAt,
        observationCount: job.observationCount || 0
      });
    }
    return { path: runPath(id), fingerprints: [...seen] };
  }

  return { directory: root, lookupJob, rememberJob, saveRun, readIndex };
}

module.exports = { defaultStoreDir, createIngestionStore };
