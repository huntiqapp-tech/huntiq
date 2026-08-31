# HUNTIQ third-party data rights gate

Before any external provider is used beyond a sandbox test, record its provenance and rights profile. HUNTIQ must not assume that paying for access means the underlying retailer data can be redistributed or resold.

## Required source metadata

Every provider integration should record:

- provider name and product/service
- upstream retailer/source family
- retrieval method (official API, licensed dataset, authorized scraper API, manual/Hunter observation)
- store/location scope and price scope
- retention permission/status
- derived-analytics permission/status
- redistribution permission/status
- image/content rights status
- terms URL and date reviewed
- contract/order-form overrides, if any

Unknown rights are treated as **internal-use only** until confirmed.

## Bright Data — current public terms review (2026-08-31)

Source: https://brightdata.com/license

The June 16, 2026 Master Service Agreement includes special terms for Data Services. The public agreement says Data may not be distributed/transmitted/reproduced/published/licensed/transferred/sold to offer a similar or competitive product. It also says service resale requires prior written authorization. Dataset exports may have a limited provider-side review period; HUNTIQ is responsible for validating and retaining permitted outputs itself.

**HUNTIQ policy:** Bright Data can be evaluated as a seed/collection provider for internal deal intelligence. Do not expose Bright Data-origin raw records through a future HUNTIQ data-resale API unless the applicable agreement/order form clearly authorizes that use. Store provenance on every imported observation.

## retailerapi — current public terms review (2026-08-31)

Source: https://retailerapi.com/legal/terms

The May 9, 2026 terms say retailerapi provides current and historical product data aggregated from publicly available retailer data. They state that returned product data originates from third-party retailers and remains subject to retailer intellectual-property rights, with special caution around redistribution of retailer images.

**HUNTIQ policy:** use returned price/history data for internal ranking and product research only until retailer-specific downstream rights are confirmed. Never treat retailerapi image URLs as HUNTIQ-owned assets. Keep provider and retailer provenance attached to every record.

## Product rule

The customer-facing HUNTIQ score, anomaly assessment, resale economics, ROI, alert priority, and other original calculations are derived outputs. A derived metric can be stored separately from raw source data, but redistribution/commercialization still requires a rights review if the metric would reconstruct or substitute for restricted source data.

## Integration gate

An adapter may be enabled for testing when:

1. credentials are stored outside the client/PWA,
2. API responses are normalized with source provenance,
3. raw data is not exposed publicly by default,
4. provider usage/rate limits are enforced, and
5. the integration is disabled from B2B export unless `redistributionAllowed === true` is explicitly recorded.
