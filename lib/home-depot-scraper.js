'use strict';

const { scrapeRetailerProduct } = require('./retailer-scraper');

const HOME_DEPOT_HOSTS = Object.freeze(['homedepot.com']);

async function scrapeHomeDepotProduct(options = {}) {
  const channel = String(options.channel || (options.storeId || options.zip ? 'local' : 'online')).toLowerCase();
  if (!['online', 'local', 'store'].includes(channel)) throw new Error('Home Depot channel must be online, local, or store');
  if ((channel === 'local' || channel === 'store') && !options.storeId && !options.zip) {
    throw new Error('Home Depot local/store observations require storeId or ZIP');
  }

  return scrapeRetailerProduct({
    ...options,
    retailer: 'home depot',
    allowedHosts: HOME_DEPOT_HOSTS,
    channel,
    provider: 'huntiq-home-depot-scraper',
    rightsClass: options.rightsClass || 'public-page-internal-validation',
    retentionPolicy: options.retentionPolicy || 'ephemeral'
  });
}

module.exports = { HOME_DEPOT_HOSTS, scrapeHomeDepotProduct };
