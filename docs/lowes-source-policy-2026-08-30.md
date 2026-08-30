# Lowe's source policy — 2026-08-30

Lowe's public Developer Hub currently documents a Product Catalog capability intended for partner integrations. The published material says the catalog can include product details, prices, promotions and inventory, including store-specific price and stock data. The sample store feed includes `product_id`, `store_id`, `selling_price`, `stock` and aisle. Lowe's also documents Product Discovery as using daily catalog feeds plus real-time Product Detail calls for current pricing, inventory and promotions.

The developer documentation shows authenticated access using bearer tokens and a client ID, and describes partner onboarding / data-feed access rather than an anonymous public retail API. The Product Catalog page also notes SFTP feeds and API access for partners.

## HUNTIQ implementation consequence

- Treat Lowe's as a strong candidate for an **authorized production connector**, because the official model supports the exact `store + item + price + inventory` semantics HUNTIQ needs.
- Do not scrape Lowe's consumer pages or invent an unauthenticated endpoint when an official partner path exists.
- The normalized adapter should map Lowe's `product_id` to `sku`, `store_id` to `storeId`, `selling_price` to `currentPrice`, and `stock` to inventory quantity, while retaining source/provenance and observation time.
- HUNTIQ can build and test the adapter contract with fixtures now, but live Lowe's ingestion is blocked until partner/API authorization and credentials are granted.
- Price-history retention policy must be checked during onboarding before persisting raw Lowe's source content indefinitely. Derived anomaly signals should remain separable from raw restricted source payloads.

Sources checked 2026-08-30:
- https://developer.lowes.com/portal/business-components/Product%20Catalog/
- https://developer.lowes.com/portal/solutions/product-discovery/
- https://portal.apim.lowes.com/

No account access, credentials, or automated retailer-page collection was used for this research.
