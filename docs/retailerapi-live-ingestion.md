# RetailerAPI live-ingestion pilot

HUNTIQ v0.9.47 introduces a server-only RetailerAPI adapter in shadow mode. It does not expose a credential to the PWA and it does not enable customer alerts.

## Request contract

- Endpoint: `GET https://api.retailerapi.com/v1/products/{id}`
- Authentication: bearer token from the server-side `RETAILERAPI_KEY` environment variable.
- Pilot request: base lookup with `include_cross_retailer=true`.
- Default identifier: the public documentation example Walmart item ID, overrideable with `RETAILERAPI_TEST_IDENTIFIER`.
- No forced refresh is used in the smoke test, keeping the first validation inexpensive and non-invasive.

Run the authenticated smoke test only from a trusted server environment:

```sh
npm run smoke:retailerapi
```

The command prints only a sanitized summary. It never prints the bearer token or raw provider payload.

## Data handling

- Provider responses are normalized into HUNTIQ's existing live-observation shape.
- Provider, provider record ID, retrieval time, source URL and rights state remain attached as provenance.
- Store/ZIP observations and online observations never share a history key. The current RetailerAPI pilot emits online-channel observations because the documented endpoint does not establish a verified local store/ZIP scope.
- Cross-retailer cells with `stale`, `indexing`, `not_found`, `blocked` or `error` status are rejected from this pilot.
- `ok` cells must carry a numeric price and a parseable freshness timestamp no older than 48 hours.
- Duplicate retailer/product/channel/location/time/price observations collapse before ingestion.
- A SHA-256 audit fingerprint can identify the raw response without publishing or logging its contents.
- Retention remains `unknown`, redistribution remains disabled, and raw retailer images are not imported.

## Alert gate

The adapter always returns `validationState: shadow` and `alertsEnabled: false`. Alert activation requires a successful authenticated smoke test plus manual verification of a representative sample against source retailer pages.

## Current deployment blocker

The existing key was not exposed to the automated development runtime used for this build, so the live authenticated request could not be executed here. Add the existing key to the server-side runtime secret named `RETAILERAPI_KEY`; do not commit it or place it in browser code. The adapter and credential-gated smoke command are ready for that validation.
