# Lowe's API fit for HUNTIQ — 2026-09-01

## Public findings
Lowe's now publishes a Developer Hub describing partner access to product catalog, pricing, promotions, inventory, store availability, and order/fulfillment capabilities.

The Product Catalog documentation says partners can receive up-to-date product details, pricing, promotions, and inventory. It describes secure catalog-file delivery over SFTP and a Product Catalog API with real-time product details, inventory, pricing, and contract pricing. The documented product-details request supports store-level context through `storeId` and ZIP-code context.

## HUNTIQ fit
This is materially more promising than treating Lowe's as a scrape-only retailer. If HUNTIQ is eligible for partner onboarding, Lowe's could become a legitimate source for:
- product identity and catalog normalization;
- current national/store-level prices;
- local inventory/availability;
- retailer-controlled freshness and provenance metadata.

## Important boundaries
- Public documentation does not mean anonymous production access. Lowe's instructs partners to register an organization, create an app, obtain credentials, and subscribe/onboard to the required feeds/APIs.
- HUNTIQ must not claim that Lowe's data is live until access is approved and an authenticated production call succeeds.
- Terms, caching/retention rights, redistribution rights, affiliate rights, and whether price-history retention is permitted must be reviewed during onboarding before storing Lowe's responses as long-term historical data.
- Store price and inventory should remain location-scoped in HUNTIQ. Never blend one store's observation into another store's baseline.
- Contract/pro-customer pricing must not be presented as generally available consumer pricing.

## Implementation implication
Keep Lowe's on the preferred official-integration list. The common retailer schema should preserve `retailer`, `product_key`, `sku`, `upc/gtin`, `store_id`, `zipcode`, `price`, `availability`, `quantity`, `observed_at`, `provider`, `rights_class`, and source/response provenance so Lowe's can plug into `live_price_observations` without retailer-specific scoring logic.

## Current blocker
Production integration requires Lowe's partner/account onboarding, application credentials, and agreement to applicable API/data terms. No user action is needed until we are ready to request that access.