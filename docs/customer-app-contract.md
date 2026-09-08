# Customer-facing PWA contract for the Scraper Engineer

Updated: 2026-09-07 for HUNTIQ v0.9.111.

This is the stable interface between server-side scraper / RetailerAPI work and the public PWA. The browser never calls scraper internals, RetailerAPI, or Bright Data. Do not put provider tokens, cookies, or raw scraper payloads in this repository or in any client bundle.

## Do not send to the PWA

- Scraper snapshots, Bright Data raw rows, or RetailerAPI cells that are still `shadow` / `shadow-live`.
- Rows lacking authenticated lookup, manual source comparison, customer-display rights, and redistribution authorization.
- Secret-bearing objects (`authorization`, `apiKey`, `accessToken`, cookies, passwords).
- Direct provider URLs that require credentials.

Those stay on the server path already implemented by `lib/customer-live-payload.js` and `lib/customer-live-authority.js`.

## Server-owned feed the PWA consumes

After `buildCustomerLivePayload` / `buildCustomerAuthorizedLivePayload` succeeds, inject one of these globals **before** `app.js` runs:

```html
<script>
  globalThis.HUNTIQ_CUSTOMER_FEED = {
    generatedAt: "2026-09-07T12:00:00.000Z",
    validatedAt: "2026-09-07T11:30:00.000Z",
    provider: "retailerapi",
    dataState: "customer-live",
    alertsEnabled: false,
    rejected: [],
    opportunities: [ /* PWA-safe customer opportunities only */ ]
  };
</script>
```

Backward compatible alias: `globalThis.HUNTIQ_CUSTOMER_OPPORTUNITIES = [ ...opportunities ]`. Prefer the envelope.

If the envelope is missing, empty after fail-closed filtering, or not injected, the PWA uses the explicit **demo fallback**. Demo cards are labeled `DEMO DATA` and cannot alert.

## Opportunity fields the app will display

Minimum PWA-safe row:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable public id. No provider secrets. |
| `dataOrigin` | yes | `live`, `cached`, `delayed`, or `demo`. Missing/unlabeled rows are withheld. |
| `validationState` | for non-demo | Must be `validated` for customer-visible live/cached/delayed rows. |
| `observedAt` | yes | ISO timestamp. Freshness is classified from this clock. |
| `retailer` | yes | Exact retailer name. |
| `title` | yes | Customer title. |
| `price` | yes | Observed shelf/checkout price. |
| `channel` | yes | `store` or `online`. Never blend channels. |
| `storeId` / `zip` | location-scoped rows | Exact store and ZIP provenance. Online rows may use `storeId: "online"`. |
| `source` | live rows | Public provider provenance only: `provider`, `providerRecordId`, `retrievedAt`, `rightsClass`, `retentionPolicy`, `redistributionAllowed`. |
| `evidenceAuthority` | live/cached | All-true envelope required or the row is withheld. |
| `priceHistoryObservations` | recommended | Timestamped, same retailer/store/channel/product, `verified: true`. |
| `completedSales` | recommended | Completed-sale comps only. Asking listings are not sold history. |
| `customerAlertEligible` | default false | The PWA still suppresses alerts unless the feed sets `alertsEnabled: true` **and** the row is fresh validated live. |

`shadow-live`, `validation-only`, unauthorized, and incomplete-authority rows are hidden. They must not appear as deals or as alert rows.

## Fixture / staging mode (zero network)

Open `/?huntiq-mode=fixture` or set `HUNTIQ_APP_MODE=fixture`. The app loads `lib/customer-feed-fixture.js` from the local bundle. No retailer provider calls are made. Use this for deterministic browser tests.

## Preview versus production

| Surface | Data | Alerts |
| --- | --- | --- |
| Public preview / GitHub Pages-style static host | Demo fallback only | Off |
| Staging fixture | Bundled labeled fixture | Off |
| Production | Server injects `HUNTIQ_CUSTOMER_FEED` from the authorized payload builder | Remain off until the existing live-readiness and decision-floor gates pass |

Health metadata: `health.json` (`alertsEnabled: false`, `providerCallsFromClient: false`).
