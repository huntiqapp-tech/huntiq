# Ace Hardware retailer / affiliate fit — public research

Updated: 2026-09-01

## What is publicly supported
Ace Hardware publicly advertises an affiliate program for websites that refer shoppers to acehardware.com. The public program page describes product links, commissions, and reporting/link tools and currently directs accepted affiliates to Impact for reporting and link generation.

Ace product pages expose public item identifiers, manufacturer identifiers, displayed price, pickup/delivery surfaces, and local-store context in the consumer experience. This is useful for product-identity research, but HUNTIQ should not infer an unrestricted API, bulk feed, retention right, or guaranteed store inventory from ordinary public pages.

## Important terms/onboarding warning
A separate public Ace affiliate participation agreement still references Pepperjam as the administering network, while the current affiliate landing page says Impact. Treat that mismatch as evidence that the controlling agreement/onboarding materials must be reviewed at enrollment time rather than coding against assumptions from an older public agreement.

The agreement also states that prices and availability can vary and are not guaranteed. HUNTIQ should therefore preserve observation timestamps and confidence rather than presenting Ace availability as certain.

## HUNTIQ fit
- **Affiliate monetization:** promising after program acceptance and review of the controlling agreement.
- **Product matching:** public item/manufacturer identifiers can help research and normalization, but production ingestion should use a licensed/approved source.
- **Local deal feed:** no unrestricted public Ace local-price/inventory developer API was established by this research. Do not build a production scraper or historical warehouse on the assumption one exists.
- **Scoring independence:** any Ace commission metadata must remain outside anomaly, profit-quality, and feed-ranking inputs.

## External requirements before activation
Affiliate activation genuinely requires application/acceptance and agreement to the program terms. Any authenticated product feed or network tooling provided after acceptance should be reviewed for permitted display, caching, retention, and redistribution before HUNTIQ stores it historically.
