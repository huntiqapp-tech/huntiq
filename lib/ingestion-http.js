'use strict';

const { clampInt, sanitizeIngestionError } = require('./live-ingestion');

function toIngestionError(error, extra) {
  const sanitized = sanitizeIngestionError(error, extra);
  const err = new Error(sanitized.message);
  err.name = 'IngestionError';
  err.ok = false;
  err.code = sanitized.code;
  err.status = sanitized.status;
  err.retryAfterSeconds = sanitized.retryAfterSeconds;
  return err;
}

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_MAX_RETRY_DELAY_MS = 4_000;
const DEFAULT_BASE_RETRY_DELAY_MS = 400;
const HARD_MAX_RETRIES = 2;
const HARD_MAX_TIMEOUT_MS = 30_000;
const HARD_MAX_RETRY_DELAY_MS = 8_000;
const HARD_MAX_CONCURRENCY = 4;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function resolveTimeoutMs(value) {
  return clampInt(value, { min: 250, max: HARD_MAX_TIMEOUT_MS, fallback: DEFAULT_TIMEOUT_MS });
}

function resolveMaxRetries(value) {
  return clampInt(value, { min: 0, max: HARD_MAX_RETRIES, fallback: DEFAULT_MAX_RETRIES });
}

function resolveRetryDelayMs(value) {
  return clampInt(value, { min: 0, max: HARD_MAX_RETRY_DELAY_MS, fallback: DEFAULT_MAX_RETRY_DELAY_MS });
}

function resolveConcurrency(value) {
  return clampInt(value, { min: 1, max: HARD_MAX_CONCURRENCY, fallback: 1 });
}

function parseRetryAfterSeconds(headers, body) {
  const header = headers?.get?.('retry-after') || headers?.get?.('Retry-After');
  const raw = header != null ? header : body?.retry_after_seconds;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchWithTimeout(fetchImpl, url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const limit = resolveTimeoutMs(timeoutMs);
  const controller = new AbortController();
  const timeoutError = () => {
    const error = new Error('ingestion request timed out');
    error.code = 'timeout';
    error.status = 408;
    error.name = 'AbortError';
    return error;
  };

  let timer;
  try {
    const response = await Promise.race([
      fetchImpl(url, {
        ...options,
        redirect: options.redirect || 'error',
        signal: controller.signal
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(timeoutError());
        }, limit);
      })
    ]);
    return response;
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'timeout') throw timeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function retryDelayMs(attempt, { retryAfterSeconds, maxRetryDelayMs, baseDelayMs = DEFAULT_BASE_RETRY_DELAY_MS } = {}) {
  const cap = resolveRetryDelayMs(maxRetryDelayMs);
  const fromHeader = retryAfterSeconds != null ? Math.ceil(Number(retryAfterSeconds) * 1000) : null;
  const exponential = baseDelayMs * (2 ** attempt);
  const delay = Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : exponential;
  return Math.min(cap, Math.max(0, delay));
}

async function fetchWithRetry(fetchImpl, url, options = {}, {
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRetries = DEFAULT_MAX_RETRIES,
  maxRetryDelayMs = DEFAULT_MAX_RETRY_DELAY_MS,
  retry = true,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  knownSecrets = []
} = {}) {
  const attempts = retry ? resolveMaxRetries(maxRetries) + 1 : 1;
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(fetchImpl, url, options, timeoutMs);
      if (response && RETRYABLE_STATUS.has(Number(response.status)) && attempt < attempts - 1) {
        let body = null;
        try { body = await response.clone?.()?.json?.(); } catch { body = null; }
        const retryAfterSeconds = parseRetryAfterSeconds(response.headers, body);
        await sleep(retryDelayMs(attempt, { retryAfterSeconds, maxRetryDelayMs }));
        lastError = Object.assign(new Error(`provider responded ${response.status}`), {
          status: response.status,
          code: response.status === 429 ? 'rate-limit' : 'provider-error',
          retryAfterSeconds
        });
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      const retryable = error?.code === 'timeout' || error?.name === 'AbortError' || error?.code === 'ECONNRESET';
      if (!retryable || attempt >= attempts - 1) throw toIngestionError(error, { knownSecrets });
      await sleep(retryDelayMs(attempt, { maxRetryDelayMs }));
    }
  }

  throw toIngestionError(lastError, { knownSecrets });
}

async function runWithConcurrency(items, worker, concurrency = 1) {
  const list = Array.isArray(items) ? items : [];
  const limit = resolveConcurrency(concurrency);
  const results = new Array(list.length);
  let next = 0;

  async function pump() {
    while (next < list.length) {
      const index = next;
      next += 1;
      results[index] = await worker(list[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, pump));
  return results;
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_RETRIES,
  DEFAULT_MAX_RETRY_DELAY_MS,
  HARD_MAX_RETRIES,
  HARD_MAX_TIMEOUT_MS,
  HARD_MAX_CONCURRENCY,
  RETRYABLE_STATUS,
  resolveTimeoutMs,
  resolveMaxRetries,
  resolveRetryDelayMs,
  resolveConcurrency,
  parseRetryAfterSeconds,
  fetchWithTimeout,
  retryDelayMs,
  fetchWithRetry,
  runWithConcurrency,
  toIngestionError
};
