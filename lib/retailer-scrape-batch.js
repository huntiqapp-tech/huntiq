'use strict';

const { enforceUsageBudget, locationKey } = require('./live-ingestion');
const { scrapeHomeDepotProduct } = require('./home-depot-scraper');

const ADAPTERS = Object.freeze({
  'home depot': scrapeHomeDepotProduct,
  'home-depot': scrapeHomeDepotProduct,
  homedepot: scrapeHomeDepotProduct
});

function fingerprint(observation = {}) {
  return [
    locationKey(observation),
    Number(observation.price),
    observation.availability || '',
    observation.observedAt || ''
  ].join('|');
}

async function runRetailerScrapeBatch(jobs = [], options = {}) {
  if (!Array.isArray(jobs)) throw new Error('scrape jobs must be an array');
  const usage = enforceUsageBudget({
    requestedRecords: jobs.length,
    monthToDateRecords: options.monthToDateRecords,
    budget: options.budget
  });
  const observations = [];
  const rejected = [];
  const seen = new Set();

  for (let index = 0; index < jobs.length; index += 1) {
    if (index >= usage.allowedRecords) {
      rejected.push({ index, retailer: String(jobs[index]?.retailer || '').toLowerCase() || null, reason: 'scrape-budget-exceeded' });
      continue;
    }
    const job = jobs[index] || {};
    const retailer = String(job.retailer || '').trim().toLowerCase();
    const adapter = (options.adapters || ADAPTERS)[retailer];
    if (!adapter) {
      rejected.push({ index, retailer: retailer || null, reason: 'unsupported-retailer-adapter' });
      continue;
    }
    try {
      const observation = await adapter({ ...job, fetchImpl: options.fetchImpl || job.fetchImpl, asOf: options.asOf || job.asOf });
      const key = fingerprint(observation);
      if (seen.has(key)) continue;
      seen.add(key);
      observations.push(observation);
    } catch (error) {
      rejected.push({ index, retailer: retailer || null, reason: String(error?.message || error) });
    }
  }

  return {
    provider: 'huntiq-retailer-scraper',
    validationState: 'shadow',
    alertsEnabled: false,
    requestedCount: jobs.length,
    acceptedCount: observations.length,
    rejectedCount: rejected.length,
    usage,
    observations,
    rejected
  };
}

module.exports = { ADAPTERS, fingerprint, runRetailerScrapeBatch };
