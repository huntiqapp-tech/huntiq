# Best Buy source policy — 2026-08-30

## Official public developer path
Best Buy maintains an official developer portal with Product, Store, Category, Recommendations, and Buying Options APIs. The Products API documentation says it exposes current and historical catalog data including pricing and availability for more than one million products, with most product information — including pricing — updated near real time.

Official documentation:
- https://developer.bestbuy.com/
- https://developer.bestbuy.com/apis

## HUNTIQ classification
**Preferred status: official API connector.**

Use the Products API for catalog identity, price, availability, specifications and imagery. Use Stores API information for store identity/location and, where supported by the API, product/store availability joins. Buying Options may be useful for open-box resale/arbitrage comparisons.

## Guardrails
- Do not infer store-level price when the API only returns an online/catalog price.
- Record `source=best-buy-api` and `sourceFamily=official-api` so observations can be separated from retailer-page evidence.
- Preserve exact SKU/UPC/model identifiers for resale matching.
- Timestamp every observation locally because HUNTIQ's anomaly engine depends on freshness and price-history windows.
- Treat a single dramatic API price as a candidate anomaly until corroborated by another observation/source when practical.

## Access note
Best Buy's developer portal offers an API-key flow. Live ingestion should be enabled only after an API key is obtained; research and adapter development can continue without credentials.

## HUNTIQ opportunity
Best Buy is unusually attractive because its official Products API explicitly includes pricing plus current/historical products, giving HUNTIQ a cleaner authorized path than retailers where public product-price APIs are unavailable. The API should become a high-priority authorized retailer connector after the core pilot is stable.
