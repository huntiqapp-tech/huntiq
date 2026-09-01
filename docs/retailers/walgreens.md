# Walgreens public integration research

Research date: 2026-09-01

## Current public route

Walgreens operates an official Developer Portal and currently advertises APIs including Store Inventory, Store Locator, Add to Cart, Photo Prints, prescription flows, and scheduling. The Store Inventory API is described by Walgreens as providing real-time inventory information for products at Walgreens retail stores. The portal requires an API key for production use.

Official sources:
- https://developer.walgreens.com/
- https://developer.walgreens.com/apis
- https://developer.walgreens.com/api/storelocator

## HUNTIQ decision

Walgreens should be treated as a promising authorized retailer integration, not a direct-scraping target. Production ingestion remains disabled until API credentials are obtained and the applicable API terms are reviewed for price/inventory retention and commercial analytics rights.

## Data model implications

- Keep `storeId`, ZIP/postal code, channel, observed timestamp, source, and verification status on every observation.
- Inventory observations must be freshness-decayed independently from price history.
- Do not infer a store price from an online price or from coupon/offer data.
- Keep member/coupon-adjusted prices separate from generally available shelf or online prices.
- If only inventory is authorized by the API, HUNTIQ must not fabricate or backfill price history from that inventory feed.

## Rights status

`authorization-required` for production API use. No credential is needed for architecture/testing work. Direct automated website collection is not enabled.