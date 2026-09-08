# HUNTIQ release readiness — preview vs production

Updated: 2026-09-08 for v0.9.112.

This document is a checklist, not a deployment credential store. Do not invent hosting accounts, API keys, or paid provider calls.

## Health / config

| Check | Where | Expected |
| --- | --- | --- |
| Package version | `package.json` | `0.9.112` |
| Offline cache name | `lib/pwa-cache-manifest.js` | `huntiq-public-v112` |
| Static health | `health.json` | same version/cache; `alertsEnabled: false`; `providerCallsFromClient: false` |
| Service worker | `sw.js` | imports the cache manifest; navigation fallback only for navigations; asset misses return 404 |
| Customer boundary | `lib/customer-app-boundary.js` | server envelope or demo/fixture fallback; no provider clients |
| Watchlist | `lib/safe-storage.js` | corrupt/non-array/quota/security errors cannot brick the app |

Run `npm run check:release` after `npm test`.

## Preview boundary

The public PWA is a static preview:

- No RetailerAPI or Bright Data calls from the browser.
- Opportunities are demonstration data unless a trusted server injects `HUNTIQ_CUSTOMER_FEED`.
- Every visible card labels `LIVE`, `CACHED`, `DELAYED`, or `DEMO DATA`, plus freshness, retailer, and store/ZIP/channel.
- Alerts stay disabled.

Local deterministic staging: `/?huntiq-mode=fixture`.

## Production boundary

Production is the same static app plus a **server-owned** injection of `buildCustomerAuthorizedLivePayload(...)` output. That server is out of this public repository on purpose.

Still required before calling anything live:

1. `RETAILERAPI_KEY` and/or `BRIGHTDATA_API_TOKEN` exist only in trusted runtime secret storage.
2. Authenticated smoke + manual source comparison recorded.
3. Customer-display and redistribution rights recorded.
4. Payload built with `enableAlerts: false` until the existing readiness gates pass.
5. Hosting/CDN/HTTPS and cache headers are operator-owned; this repo does not publish credentials or claim an external deploy.

## Remaining credential / deployment-only blockers

- No RetailerAPI or Bright Data runtime secrets are present in this workspace.
- No production host, DNS, or CDN is configured in-repo.
- Completed-sale live history still needs a rights-cleared marketplace source before live 30/60/90 sold claims.
- Browser notifications remain out of scope until the live customer feed is authorized.
