# Tractor Supply retailer fit — 2026-09-03

Public-source research only. No account access, credentials, private APIs, or authenticated retailer data were used.

## Findings

- Tractor Supply states that product prices may vary by geographic market and may differ between TractorSupply.com and stores. HUNTIQ must therefore keep store/location/channel price histories separate rather than blending them into one baseline.
- Tractor Supply's current price-match policy excludes clearance, close-outs/liquidations, advertising errors, third-party marketplace sellers, used/refurbished items, subscription pricing, bundles, rebates, financing-dependent offers and other special cases. A qualifying price match belongs in transaction-specific acquisition economics only after eligibility is verified; it must never enter raw shelf-price history.
- Price matches require the item to be in stock and the competing price to be valid at the time of the match. This makes price-match value conditional execution evidence rather than guaranteed acquisition cost.
- Neighbor's Club rewards are issued after the member reaches a points threshold and are available 15 days later. Newly earned rewards are deferred value, not an immediate checkout-price reduction.
- Tractor Supply publishes bulk discounts for eligible categories. Bulk discounts are quantity-dependent acquisition economics and should be modeled separately from raw unit-price history.

## HUNTIQ modeling rules

1. Isolate Tractor Supply price history by retailer, product, location and channel.
2. Preserve retailer-marked clearance as a lifecycle state rather than treating it as an ordinary fresh anomaly.
3. Keep approved price matches outside raw shelf-price history.
4. Do not reduce current acquisition cost by newly earned Neighbor's Club rewards; model those as deferred value.
5. Apply bulk discounts only when quantity and eligibility are known.
6. Treat in-stock requirements as execution evidence, not a permanent inventory guarantee.
7. Keep affiliate economics out of ranking and Flip Score.

## Public sources reviewed

- Tractor Supply Price Match: https://www.tractorsupply.com/tsc/cms/price-match
- Tractor Supply Terms and Conditions of Use: https://www.tractorsupply.com/tsc/cms/policies-information/customer-solutions/terms-and-conditions-of-use
- Neighbor's Club FAQ: https://www.tractorsupply.com/tsc/cms/neighbors-club-faq
- Tractor Supply Bulk Discounts: https://www.tractorsupply.com/tsc/cms/bulk-discounts
