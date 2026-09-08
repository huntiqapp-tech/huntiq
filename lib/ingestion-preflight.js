'use strict';

const KNOWN_PROVIDERS = Object.freeze(['brightdata', 'retailerapi', 'upcitemdb', 'scraper']);

const SECRET_CATALOG = Object.freeze([
  {
    name: 'BRIGHTDATA_API_TOKEN',
    providers: ['brightdata'],
    requiredForLive: true,
    description: 'Server-side Bright Data API bearer token'
  },
  {
    name: 'BRIGHTDATA_TEST_URL',
    providers: ['brightdata'],
    requiredForLive: true,
    description: 'Explicit Home Depot product URL for bounded smoke/live jobs'
  },
  {
    name: 'BRIGHTDATA_TEST_ZIP',
    providers: ['brightdata'],
    requiredForLive: false,
    description: 'Optional five-digit ZIP for Home Depot local identity'
  },
  {
    name: 'RETAILERAPI_KEY',
    providers: ['retailerapi'],
    requiredForLive: true,
    description: 'Server-side RetailerAPI bearer token'
  },
  {
    name: 'RETAILERAPI_TEST_IDENTIFIER',
    providers: ['retailerapi'],
    requiredForLive: false,
    description: 'Optional product identifier override for smoke/live jobs'
  },
  {
    name: 'UPCITEMDB_USER_KEY',
    providers: ['upcitemdb'],
    requiredForLive: true,
    description: 'Paid UPCitemdb user_key header; trial is never used unattended'
  }
]);

function cleanList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (value == null || value === '') return [];
  return String(value).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function isConfigured(name, env = process.env) {
  const value = env[name];
  return value != null && String(value).trim() !== '';
}

function reportIngestionPreflight({
  env = process.env,
  providers,
  mode
} = {}) {
  const selected = cleanList(providers == null ? env.INGEST_PROVIDERS : providers);
  const unknown = selected.filter((name) => !KNOWN_PROVIDERS.includes(name));
  const resolvedMode = String(mode || env.INGEST_MODE || 'dry-run').trim().toLowerCase() === 'live' ? 'live' : 'dry-run';
  const relevant = SECRET_CATALOG.filter((item) => !selected.length || item.providers.some((provider) => selected.includes(provider)));

  const secrets = relevant.map((item) => ({
    name: item.name,
    configured: isConfigured(item.name, env),
    requiredForLive: item.requiredForLive,
    providers: [...item.providers],
    optional: !item.requiredForLive
  }));

  const missingRequired = resolvedMode === 'live'
    ? secrets.filter((item) => item.requiredForLive && !item.configured).map((item) => item.name)
    : [];

  const configuredNames = secrets.filter((item) => item.configured).map((item) => item.name);
  const missingNames = secrets.filter((item) => !item.configured).map((item) => item.name);

  return {
    mode: resolvedMode,
    providers: selected,
    unknownProviders: unknown,
    liveReady: resolvedMode !== 'live' || (selected.length > 0 && missingRequired.length === 0 && unknown.length === 0),
    failClosed: resolvedMode === 'live' && (selected.length === 0 || missingRequired.length > 0 || unknown.length > 0),
    secrets,
    configuredNames,
    missingNames,
    missingRequiredNames: missingRequired
  };
}

module.exports = {
  KNOWN_PROVIDERS,
  SECRET_CATALOG,
  reportIngestionPreflight
};
