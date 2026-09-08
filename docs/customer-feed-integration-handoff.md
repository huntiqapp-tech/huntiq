# Customer-feed integration handoff — v0.9.111

Status: **ready for the parallel ingestion track**. Do not wait for credentials, hosting, or a live deploy. The PWA contract is frozen; ingest against it.

Verified: local `npm test` and GitHub **PR Guard** on `cursor/pwa-customer-feed-boundary-46a1` (head `f1e30eb`) passed, including Chrome E2E. Field names and envelope shape live in `docs/customer-app-contract.md` and must not be renamed on this track.

## What to emit

Server-only, after the existing payload builders:

```js
const payload = buildCustomerAuthorizedLivePayload(batch, validation, {
  asOf,
  enableAlerts: false
});
globalThis.HUNTIQ_CUSTOMER_FEED = payload;
```

Inject that envelope **before** `app.js`. Prefer the envelope over `HUNTIQ_CUSTOMER_OPPORTUNITIES`. If the envelope is absent or all rows fail closed, the PWA shows labeled demo fallback. It never calls RetailerAPI, Bright Data, or scraper internals.

Keep using `lib/customer-live-payload.js` and `lib/customer-live-authority.js`. Do not send `shadow` / `shadow-live` snapshots, secret-bearing objects, or unlabeled rows to the browser.

## What the PWA already handles

- LIVE / CACHED / DELAYED / DEMO DATA labels, freshness, retailer, store/ZIP/channel
- Hide unlabeled, validation-only, unauthorized, and incomplete `evidenceAuthority` rows
- Suppress alerts unless `alertsEnabled === true` **and** the row is fresh validated live
- Zero-network staging at `/?huntiq-mode=fixture` (`lib/customer-feed-fixture.js`)

## Ingestion track — continue without this branch

1. Authenticated provider lookup in a trusted runtime (secrets stay out of git and out of the PWA).
2. Manual source comparison, display/retention/redistribution rights.
3. Build the envelope with `enableAlerts: false`.
4. Compare a sanitized fixture-shaped payload against `docs/customer-app-contract.md` before injecting.

Credential smoke, CDN/hosting, and live 30/60/90 sold-history access remain operator-owned. They do not block this handoff.
