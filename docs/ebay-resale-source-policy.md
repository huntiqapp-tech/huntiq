# eBay resale source policy

Research date: 2026-08-30

## What HUNTIQ can use without pretending active listings are sold comps

- eBay's Browse API is the supported Buy API for searching active purchasable listings by keyword, GTIN, product, category, aspects, compatibility criteria, or image.
- Browse item data exposes listing end/availability semantics, so HUNTIQ can use it for current competition and asking-price observations after developer authorization.
- Active asking prices are not sold prices. They must never populate HUNTIQ's 30/60/90-day sold medians.

## Sold-history limitation

- eBay documents Marketplace Insights as the API that retrieves sales history of items sold on eBay.
- Marketplace Insights is Limited Release, and eBay's current Buy API filter documentation says it is restricted and not open to new users at this time.
- Therefore HUNTIQ must not claim official eBay sold-history coverage unless the project is explicitly granted Marketplace Insights access or another eBay-approved sold-data path becomes available.

## Connector behavior

1. Match products using the strongest available identifier in this order: GTIN/UPC, ePID/catalog product, manufacturer model, then normalized title + condition.
2. Store active listings separately from sold comps.
3. Timestamp every active observation locally and expire active-listing evidence using HUNTIQ's freshness policy.
4. Never infer a completed sale merely because an active listing later disappears or has an end date in the past.
5. Until approved sold-history access exists, label eBay resale estimates that rely on non-official or user-supplied sold data with the appropriate evidence confidence and provenance.

## Official references

- eBay Developers: Get Started on a Buying Application — Marketplace Insights retrieves sales history and is Limited Release.
- eBay Developers: Buy API Field Filters — Marketplace Insights is restricted and not open to new users at the time of research.
- eBay Developers: Browse API — current item search/retrieval and availability semantics.
