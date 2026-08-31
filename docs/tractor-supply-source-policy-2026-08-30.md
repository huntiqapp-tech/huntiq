# Tractor Supply source policy — 2026-08-30

## Public findings

Tractor Supply's current terms say product prices on TractorSupply.com may vary from other advertised prices because geographic markets differ, and prices may vary between the site and physical Tractor Supply stores. Shipping, handling, and sales tax are separate from the displayed merchandise price and are added to the order total where applicable.

Tractor Supply's store selector requires a ZIP code to expose localized pricing, pickup availability, and delivery services. Changing the selected store can change localized pricing and pickup routing.

The retailer's public price-match policy requires an identical item and excludes third-party marketplace offers, used/refurbished/preowned products, close-outs/liquidations, subscribe-and-save pricing, bundles, rebates, financing-linked offers, advertising errors, special orders, clearance, and TSC services. The competing price must be valid at the time of the match and the item must be in stock.

Buy Online Pickup In Store is supported across stores for eligible items, but an order is not truly ready until the customer receives a separate Ready for Pickup notice. Pickup items are generally held for two days; inventory can become unavailable and substitutions may be offered.

## HUNTIQ ingestion rules

1. Keep `tractorsupply.com`, physical-store, pickup, ship-to-store, and delivery observations channel-scoped. Never collapse them into one historical baseline solely because the SKU matches.
2. Preserve store or ZIP localization on every local observation. A price seen for one selected store is not evidence of a nationwide price.
3. Treat shipping, oversize freight, delivery charges, and sales tax as acquisition-cost inputs, not merchandise-price observations.
4. Preserve condition and exact product identity. Do not use used/refurbished/preowned or marketplace comparisons as equivalent new-item retailer prices.
5. Store clearance and liquidation observations as explicit price states. Do not infer that a clearance price is broadly matchable or nationally obtainable.
6. Treat pickup inventory as provisional until retailer availability is confirmed. A Ready for Pickup state is stronger fulfillment evidence than an item merely appearing eligible for pickup.
7. Never record an unavailable or substituted item as a zero-dollar price.
8. Advertising-error exclusions are useful evidence that an extreme price can be invalidated at checkout. HUNTIQ should therefore keep checkout/fulfillment confidence separate from anomaly magnitude.

## Relevance to HUNTIQ scoring

Tractor Supply reinforces two architectural rules already used by HUNTIQ: store/channel isolation for price history, and separate fulfillment confidence for unusually low prices. Extreme local price anomalies should be high-signal candidates, not guaranteed obtainable inventory, until the selected store and fulfillment state corroborate them.
