# eBay resale / affiliate integration research

Research date: 2026-09-01.

## Publicly confirmed capabilities

- eBay Browse API supports search by keyword, GTIN, category, eBay product ID and image, making it useful for matching a retail scan to currently listed resale inventory.
- Browse API item details expose current purchasable-listing information including price, shipping/seller context and availability/end-date state.
- eBay documents inventory refresh paths using Feed APIs and notifications for tracked listing price/availability changes.
- eBay's React Items Widget is powered by Browse API and explicitly supports affiliate IDs / affiliate URLs. Browse integrations can also use end-user context for eBay Partner Network revenue sharing.
- The Marketplace Insights API is restricted and is not open to new users at this time. HUNTIQ must therefore NOT treat public Browse API results as verified sold-history evidence.

## HUNTIQ normalization rules

1. Classify Browse API listings as `asking` evidence, never `sold`, unless a separate authorized source explicitly proves a completed sale.
2. Product matching should prefer GTIN/UPC exact matches, then product identifiers, then high-confidence normalized title/model matches.
3. Keep item price and shipping cost separate so resale economics can compute delivered asking price consistently.
4. Preserve condition and buying option; do not mix new, used, refurbished, auction and fixed-price observations into a single median without an explicit cohort rule.
5. Store source timestamp and item end/availability state so stale listings do not inflate market confidence.
6. Affiliate destination metadata must remain separate from ranking/scoring. Commission eligibility must never improve HUNTIQ Score.
7. 30/60/90-day `sold` metrics remain unavailable from this integration alone. Until an authorized sold-data source exists, UI and alerts must label eBay Browse values as active asking-market evidence.

## Proposed adapter output

```js
{
  marketplace: 'ebay',
  evidenceType: 'asking',
  source: 'ebay-browse-api',
  gtin,
  title,
  condition,
  price,
  shipping,
  deliveredPrice,
  buyingOption,
  itemId,
  itemWebUrl,
  observedAt,
  availabilityStatus,
  affiliateEligible
}
```

## Production requirements

Production Browse API calls require eBay developer credentials / an application access token. Affiliate revenue sharing additionally requires the appropriate eBay Partner Network relationship/configuration. These credentials and IDs belong in private environment/secret storage and must never be committed to this public repository.

## Sources

- eBay Developers — Browse API: https://developer.ebay.com/api-docs/buy/api-browse.html
- eBay Developers — Buy API field filters: https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
- eBay Developers — Inventory Discovery and Refresh: https://developer.ebay.com/develop/buying-apps/inventory-discovery-and-refresh
- eBay Developers — Buy APIs Overview: https://developer.ebay.com/api-docs/buy/static/buy-overview.html
