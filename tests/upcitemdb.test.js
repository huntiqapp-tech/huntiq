'use strict';

const assert = require('assert');
const os = require('os');
const path = require('path');
const fixture = require('./fixtures/upcitemdb-lookup.json');
const {
  UPCITEMDB_PAID_URL,
  UpcItemDbError,
  buildUpcItemDbLookupRequest,
  safeRequestLog,
  normalizeUpcItemDbPayload,
  lookupUpcIdentity
} = require('../lib/upcitemdb');

const request = buildUpcItemDbLookupRequest({ userKey: 'upc-secret-key', upc: '012345678905' });
assert.equal(request.mode, 'paid');
assert.ok(request.url.startsWith(UPCITEMDB_PAID_URL));
assert.ok(request.url.includes('upc=012345678905'));
assert.equal(request.headers.user_key, 'upc-secret-key');
assert.equal(request.headers.key_type, '3scale');
assert.throws(() => buildUpcItemDbLookupRequest({ upc: '012345678905' }), /UPCITEMDB_USER_KEY/);
assert.throws(() => buildUpcItemDbLookupRequest({ userKey: 'x', upc: 'abc' }), /UPC\/EAN\/GTIN/);

const logged = safeRequestLog(request);
assert.equal(logged.headers.user_key, '[REDACTED]');
assert.ok(!JSON.stringify(logged).includes('upc-secret-key'));

const trial = buildUpcItemDbLookupRequest({ upc: '012345678905', useTrial: true });
assert.equal(trial.mode, 'trial');
assert.ok(!trial.headers.user_key);

const normalized = normalizeUpcItemDbPayload(fixture, { retrievedAt: '2026-09-07T12:00:00Z', upc: '012345678905' });
assert.equal(normalized.length, 1);
assert.equal(normalized[0].ok, true);
assert.equal(normalized[0].priceAuthority, false);
assert.equal(normalized[0].retailerPriceVerification, false);
assert.equal(normalized[0].identity.upc, '012345678905');
assert.equal(normalized[0].identity.title, 'Sanitized identity fixture drill');
assert.equal(normalized[0].identity.brand, 'FixtureBrand');
assert.equal(normalized[0].alertsEnabled, false);
assert.equal(normalized[0].lowest_recorded_price, undefined);
assert.equal(normalized[0].offers, undefined);
assert.ok(!JSON.stringify(normalized).includes('24.99'));
assert.ok(!JSON.stringify(normalized).includes('lowest_recorded_price'));

assert.throws(() => normalizeUpcItemDbPayload({ code: 'OK' }), /malformed items array/);
assert.throws(() => normalizeUpcItemDbPayload({ code: 'INVALID_UPC', message: 'bad' }), /bad/);

const malformed = normalizeUpcItemDbPayload({
  code: 'OK',
  items: [{ upc: '012345678905' }]
}, { upc: '012345678905' });
assert.equal(malformed[0].ok, false);
assert.equal(malformed[0].reason, 'malformed-identity');

(async () => {
  const result = await lookupUpcIdentity({
    userKey: 'upc-secret-key',
    upc: '012345678905',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => fixture
    })
  });
  assert.equal(result.identities.length, 1);
  assert.equal(result.observations, undefined);
  assert.equal(result.priceAuthority, false);
  assert.equal(result.retailerPriceVerification, false);
  assert.equal(result.alertsEnabled, false);
  assert.ok(!JSON.stringify(result).includes('upc-secret-key'));

  await assert.rejects(() => lookupUpcIdentity({
    userKey: 'upc-secret-key',
    upc: '012345678905',
    fetchImpl: async () => ({
      ok: false,
      status: 429,
      headers: { get: (name) => String(name).toLowerCase() === 'retry-after' ? '2' : null },
      json: async () => ({ code: 'EXCEED_LIMIT', message: 'slow down' })
    }),
    maxRetries: 0
  }), (error) => error instanceof UpcItemDbError && error.status === 429 && error.code === 'EXCEED_LIMIT');

  console.log('upcitemdb tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
