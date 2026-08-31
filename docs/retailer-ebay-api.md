# eBay public API fit for HUNTIQ

Checked: 2026-08-31

## Useful capabilities

eBay's current Browse API supports active-listing discovery by keyword, category, GTIN, eBay product ID, and image, plus item details such as current price, item location, seller information, shipping and availability. This is useful for HUNTIQ's active-market competition, current ask prices, product matching, and listing-density signals.

The current eBay developer documentation also exposes Feed/Feed Beta for inventory discovery and Notification API support for listing changes. These can become useful later for large-scale active-market refreshes if HUNTIQ receives the required application access.

## Important resale-comp limitation

HUNTIQ should not assume that the current Browse API provides completed/sold-market history. The legacy Finding API, which included `findCompletedItems`, was decommissioned/replaced by Browse API in 2025. eBay's Marketplace Insights API remains restricted and is not open to new users according to current eBay documentation.

Therefore HUNTIQ's 30/60/90-day sold-comps layer must remain provider-neutral. Use eBay Browse for active asks and product/competition context once credentials are approved, while sold-history inputs should come only from an eBay capability HUNTIQ is explicitly granted, another licensed provider, or rights-cleared first-party/community data.

## HUNTIQ mapping

- Browse active listing price -> `currentAsks`
- Browse result count / active matches -> `activeListingCount`
- GTIN / EPID / item specifics -> product matching confidence
- Item location -> optional geographic competition context
- Sold 30/60/90 windows -> **do not fabricate from Browse API**
- Marketplace Insights -> treat as unavailable unless eBay explicitly grants access

Sources:
- https://developer.ebay.com/develop/api/buy/browse_api
- https://developer.ebay.com/api-docs/buy/static/api-browse.html
- https://developer.ebay.com/develop/get-started/api-deprecation-status
- https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
