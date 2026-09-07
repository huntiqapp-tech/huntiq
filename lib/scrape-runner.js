const { enforceUsageBudget, locationKey, redactSecrets } = require('./live-ingestion');
const { scrapeHomeDepotProduct } = require('./scrapers/home-depot');

const DEFAULT_RATE_LIMIT = Object.freeze({
  minIntervalMs: 1_000,
  maxConcurrency: 1
});

const HOME_DEPOT_ALIASES = new Set(['home depot', 'home-depot', 'homedepot']);

function cleanText(value) {
  return value == null ? null : String(value).trim() || null;
}

function targetFingerprint(target = {}) {
  return [
    String(target.retailer || '').trim().toLowerCase(),
    String(target.url || '').trim(),
    String(target.zip || '').trim(),
    String(target.storeId || '').trim()
  ].join('|');
}

function observationDedupeKey(observation = {}) {
  return [
    locationKey(observation),
    observation.observedAt || '',
    Number(observation.price),
    observation.availability || ''
  ].join('|');
}

function normalizeRetailerName(value) {
  return String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
}

function resolveScrapeAdapter(target = {}) {
  const retailer = normalizeRetailerName(target.retailer);
  if (HOME_DEPOT_ALIASES.has(retailer) || HOME_DEPOT_ALIASES.has(String(target.retailer || '').trim().toLowerCase())) {
    return scrapeHomeDepotProduct;
  }
  throw new Error(`unsupported scraper retailer: ${cleanText(target.retailer) || 'unknown'}`);
}

function rejectionFromError(target, error) {
  return redactSecrets({
    retailer: cleanText(target?.retailer),
    url: cleanText(target?.url),
    zip: cleanText(target?.zip),
    storeId: cleanText(target?.storeId),
    reason: cleanText(error?.message) || 'scrape-failed'
  });
}

function dedupeTargets(targets = []) {
  const unique = [];
  const seen = new Set();
  const duplicates = [];
  for (const target of targets) {
    const fingerprint = targetFingerprint(target);
    if (seen.has(fingerprint)) {
      duplicates.push(redactSecrets({
        retailer: cleanText(target?.retailer),
        url: cleanText(target?.url),
        zip: cleanText(target?.zip),
        storeId: cleanText(target?.storeId),
        reason: 'duplicate-target'
      }));
      continue;
    }
    seen.add(fingerprint);
    unique.push(target);
  }
  return { unique, duplicates };
}

function sleep(ms, sleepImpl) {
  const wait = Number(ms) || 0;
  if (wait <= 0) return Promise.resolve();
  if (typeof sleepImpl === 'function') return Promise.resolve(sleepImpl(wait));
  return new Promise((resolve) => setTimeout(resolve, wait));
}

async function scrapeOneTarget(target, options) {
  if (!cleanText(target?.retailer)) throw new Error('retailer is required');
  if (!cleanText(target?.url)) throw new Error('valid absolute retailer URL is required');
  const adapter = resolveScrapeAdapter(target);
  return adapter({
    ...target,
    fetchImpl: options.fetchImpl,
    headers: options.headers,
    timeoutMs: options.timeoutMs,
    maxResponseBytes: options.maxResponseBytes,
    observedAt: target.observedAt || options.observedAt,
    rightsClass: 'internal-only'
  });
}

async function runScrapeBatch({
  targets = [],
  fetchImpl,
  headers,
  timeoutMs,
  maxResponseBytes,
  observedAt,
  monthToDateRecords = 0,
  budget,
  minIntervalMs = DEFAULT_RATE_LIMIT.minIntervalMs,
  maxConcurrency = DEFAULT_RATE_LIMIT.maxConcurrency,
  sleepImpl
} = {}) {
  if (!Array.isArray(targets)) throw new Error('scrape targets array is required');
  const effectiveConcurrency = Math.max(1, Math.min(1, Math.floor(Number(maxConcurrency) || 1)));
  const intervalMs = Math.max(0, Math.floor(Number(minIntervalMs) || 0));
  const { unique, duplicates } = dedupeTargets(targets);
  const usage = enforceUsageBudget({
    requestedRecords: unique.length,
    monthToDateRecords,
    budget
  });

  const observations = [];
  const rejected = [...duplicates];
  let attempted = 0;

  for (const target of unique) {
    if (attempted >= usage.allowedRecords) {
      rejected.push(redactSecrets({
        retailer: cleanText(target.retailer),
        url: cleanText(target.url),
        zip: cleanText(target.zip),
        storeId: cleanText(target.storeId),
        reason: 'usage-budget-exceeded'
      }));
      continue;
    }

    if (attempted > 0) await sleep(intervalMs, sleepImpl);
    attempted += 1;

    try {
      const observation = await scrapeOneTarget(target, {
        fetchImpl,
        headers,
        timeoutMs,
        maxResponseBytes,
        observedAt
      });
      observations.push(observation);
    } catch (error) {
      rejected.push(rejectionFromError(target, error));
    }
  }

  const uniqueObservations = [];
  const seenObservations = new Set();
  for (const observation of observations) {
    const key = observationDedupeKey(observation);
    if (seenObservations.has(key)) {
      rejected.push({
        retailer: observation.retailer,
        url: observation.source?.evidenceUrl || null,
        zip: observation.zip,
        storeId: observation.storeId,
        reason: 'duplicate-observation'
      });
      continue;
    }
    seenObservations.add(key);
    uniqueObservations.push(observation);
  }

  return {
    provider: 'huntiq-scraper',
    validationState: 'shadow',
    alertsEnabled: false,
    dataState: 'shadow-live',
    rightsClass: 'internal-only',
    experimental: true,
    retrievedAt: new Date().toISOString(),
    usage,
    rateLimit: {
      minIntervalMs: intervalMs,
      maxConcurrency: effectiveConcurrency
    },
    observations: uniqueObservations,
    rejected
  };
}

function sanitizeScrapeSummary(batch = {}) {
  return redactSecrets({
    ok: Array.isArray(batch.observations),
    provider: batch.provider || 'huntiq-scraper',
    validationState: batch.validationState || 'shadow',
    alertsEnabled: batch.alertsEnabled === true,
    dataState: batch.dataState || 'shadow-live',
    rightsClass: batch.rightsClass || 'internal-only',
    experimental: batch.experimental !== false,
    acceptedObservations: Array.isArray(batch.observations) ? batch.observations.length : 0,
    rejectedObservations: Array.isArray(batch.rejected) ? batch.rejected.length : 0,
    retailers: [...new Set((batch.observations || []).map((row) => row.retailer).filter(Boolean))],
    adapters: [...new Set((batch.observations || []).map((row) => row.source?.retailerAdapter).filter(Boolean))],
    channels: [...new Set((batch.observations || []).map((row) => row.channel).filter(Boolean))],
    pricePresentCount: (batch.observations || []).filter((row) => Number.isFinite(Number(row.price))).length,
    rejectionReasons: [...new Set((batch.rejected || []).map((row) => row.reason).filter(Boolean))]
  });
}

module.exports = {
  DEFAULT_RATE_LIMIT,
  targetFingerprint,
  observationDedupeKey,
  resolveScrapeAdapter,
  runScrapeBatch,
  sanitizeScrapeSummary
};
