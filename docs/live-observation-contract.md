# Canonical live observation contract

Authority: server-side ingestion (`lib/live-ingestion.js`). This is the shape adapters must emit before any history, rights, or customer mapping. The public PWA is not a writer of this contract and was not changed by this work.

UPCitemdb is **not** a priced observation. It produces identity records only (`priceAuthority: false`).

## Canonical fields

| Field | Type | Meaning |
| --- | --- | --- |
| `retailer` | string | Lowercase retailer name |
| `sku` | string | Stable product identity used in location keys |
| `productId` | string\|null | Provider/retailer product id |
| `upc` | string\|null | UPC/GTIN when known |
| `modelNumber` | string\|null | Model / MPN |
| `title` | string\|null | Display title |
| `price` | number | Observed shelf/checkout price |
| `currency` | string | Default `USD` |
| `availability` | string\|null | Text availability, not a guarantee |
| `quantity` | integer\|null | Observed on-hand/shelf count |
| `storeId` | string\|null | Store identity. `null` for online. Never invent `"online"` as a store id on the canonical object |
| `zip` | string\|null | Five-digit ZIP when the price is location-scoped |
| `channel` | `online`\|`local` | `store` input is normalized to `local` |
| `observedAt` | ISO-8601 | Observation time |
| `source` | object | Structured provenance (never a string on the canonical object) |
| `source.provider` | string | `bright-data`, `retailerapi`, `huntiq-home-depot-scraper`, … |
| `source.evidenceUrl` | string\|null | Public evidence URL |
| `source.datasetId` | string\|null | Provider dataset / extractor |
| `source.rightsClass` | string | Default `internal-only` |
| `source.retentionPolicy` | string\|null | `unknown` until rights review |
| `source.redistributionAllowed` | boolean | Always false until explicit rights |
| `locationKey` | string | `retailer\|sku\|channel\|store:{id}\|zip:{zip}\|online` |
| `validationState` | string | Default `shadow` |
| `alertsEnabled` / `alertEligible` | false | Hard-disabled on this path |

## Required aliases (adapters must keep these in sync)

These exist so SQL and existing history helpers can read adapter output without guessing.

| Canonical | Alias | Consumer |
| --- | --- | --- |
| `quantity` | `inventory`, `inventoryCount` | `history.js` / markdown / rights contract read `inventory` or `inventoryCount`. `quantity` is **shelf count**, not purchase quantity |
| `zip` | `zipcode` | `db/004_live_price_observations.sql`, `live-history.toObservationRow` |
| `storeId` | `store_id` | SQL |
| `productId` | `product_id` | SQL |
| `modelNumber` | `model_number` | SQL |
| `observedAt` | `timestamp` | Older adapter payloads |
| `price` | `currentPrice` | `retailer-observation-contract` |
| `source.provider` | `provider` (scalar) | SQL `provider` column |
| `source.evidenceUrl` | `sourceUrl`, `url` | SQL `source_url`; `toObservationRow` |
| `source.sourceFamily` | `sourceFamily` | Baseline/history compactors that key on family |

`attachObservationAliases()` is the single writer of these aliases. Adapters must not set `inventory` to a different meaning than `quantity`.

## Projectors (ingestion-owned, not PWA)

Call these instead of feeding canonical objects into browser history helpers:

- `toLegacyHistoryFields(observation)` — `source` becomes a **string** (`provider`), `inventory` copies `quantity`, and location is encoded into `storeId` as the real store id, `zip:{zip}`, or `"online"`. `lib/history.js` has no ZIP/channel fields; this projector is the only supported bridge.
- `toRightsContractFields(observation)` — maps `price` → `currentPrice`, `quantity` → `inventoryCount`, `source` → provider string, same `storeId` encoding.

Do not pass a canonical `source` object into `lib/history.js` or `lib/snapshot-store.js`. Those modules still treat `source` as a string. That is a downstream consumer gap, not an adapter license to flatten provenance on the canonical object.

## Location / channel keys

Ingestion identity:

```
locationKey = retailer|sku|channel|store:{storeId}|zip:{zip}|online
```

`lib/live-history.js` `historyKey` is still `retailer|productId|store:{id}|zip:{zip}|online` and **omits channel**. Store/ZIP isolation is preserved; online vs local at the same store is a known downstream key gap and is not changed here (PWA/history compactors stay untouched).

Online observations: `channel=online`, `storeId=null`, `zip=null`, location token `online`.
Local observations: `channel=local` plus `storeId` and/or `zip`. ZIP-only and store-only rows must not share a `locationKey`.

## Explicit non-mappings

- UPCitemdb `lowest_recorded_price` / `offers` are not retailer prices.
- Retailer MSRP / list / compare-at is not `price`.
- `quantity` is not buy-quantity and not resale lot size.
- Canonical `source` is not a UI badge string.

## Example

```json
{
  "retailer": "home depot",
  "sku": "1007172275",
  "productId": "319386960",
  "price": 49.03,
  "currentPrice": 49.03,
  "quantity": 3,
  "inventory": 3,
  "zip": "18360",
  "zipcode": "18360",
  "storeId": "4129",
  "channel": "local",
  "observedAt": "2026-08-31T12:00:00Z",
  "provider": "bright-data",
  "sourceFamily": "licensed-collection",
  "sourceUrl": "https://www.homedepot.com/p/example/100000001",
  "source": {
    "provider": "bright-data",
    "evidenceUrl": "https://www.homedepot.com/p/example/100000001",
    "sourceFamily": "licensed-collection",
    "rightsClass": "internal-only"
  },
  "locationKey": "home depot|1007172275|local|store:4129"
}
```
