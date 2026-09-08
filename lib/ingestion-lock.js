'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_LOCK_NAME = 'huntiq-ingestion.lock';
const DEFAULT_STALE_MS = 30 * 60 * 1000;

function defaultLockPath() {
  return path.join(os.tmpdir(), 'huntiq-ingestion', DEFAULT_LOCK_NAME);
}

function pidIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLock(lockPath) {
  try {
    return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  } catch {
    return null;
  }
}

function isStale(record, now, staleMs) {
  if (!record) return true;
  const acquiredAt = Date.parse(record.acquiredAt);
  const expiresAt = Date.parse(record.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt <= now) return true;
  if (Number.isFinite(acquiredAt) && now - acquiredAt > staleMs) return true;
  return !pidIsAlive(Number(record.pid));
}

function acquireIngestionLock({
  lockPath = defaultLockPath(),
  staleMs = DEFAULT_STALE_MS,
  now = Date.now(),
  holder = `pid:${process.pid}`
} = {}) {
  const resolved = path.resolve(lockPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const expiresAt = new Date(now + staleMs).toISOString();
  const record = {
    pid: process.pid,
    holder,
    acquiredAt: new Date(now).toISOString(),
    expiresAt
  };

  try {
    fs.writeFileSync(resolved, JSON.stringify(record), { flag: 'wx' });
    return { acquired: true, lockPath: resolved, record };
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const existing = readLock(resolved);
    if (isStale(existing, now, staleMs)) {
      try { fs.unlinkSync(resolved); } catch { /* another runner may have claimed it */ }
      try {
        fs.writeFileSync(resolved, JSON.stringify(record), { flag: 'wx' });
        return { acquired: true, lockPath: resolved, record, stoleStaleLock: true };
      } catch (retryError) {
        if (retryError?.code !== 'EEXIST') throw retryError;
      }
    }
    return {
      acquired: false,
      lockPath: resolved,
      reason: 'overlap',
      existing
    };
  }
}

function releaseIngestionLock(lockPath) {
  const resolved = path.resolve(lockPath || defaultLockPath());
  const existing = readLock(resolved);
  if (existing && Number(existing.pid) !== process.pid) return false;
  try {
    fs.unlinkSync(resolved);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return true;
    throw error;
  }
}

module.exports = {
  DEFAULT_LOCK_NAME,
  DEFAULT_STALE_MS,
  defaultLockPath,
  acquireIngestionLock,
  releaseIngestionLock
};
