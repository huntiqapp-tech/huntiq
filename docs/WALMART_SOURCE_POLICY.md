# Walmart public source policy

Researched from Walmart public help, corporate FAQ, policies, and current Terms of Use in August 2026.

## HUNTIQ rules

- Keep Walmart store observations store-scoped. Walmart states prices can vary from store to store because stores manage local inventory and may clear overstock or respond to local competition.
- Keep Walmart.com pricing separate from physical-store pricing. Walmart states website merchandise/prices do not necessarily reflect store merchandise/prices.
- For Walmart Pickup and Delivery, preserve the packing store identity. Walmart's current Terms say Pickup and Delivery pricing is the same as the store that packs and delivers the order, but prices can differ across stores.
- Keep Walmart Marketplace third-party sellers separate from Walmart first-party retail offers. Never mix marketplace seller price history with Walmart-owned inventory baselines.
- Preserve fulfillment channel and seller identity for shipping, pickup, store delivery, and marketplace offers. Delivery/Express fees are acquisition costs, not merchandise-price observations.
- Treat local availability as time- and location-sensitive evidence. A product that is unavailable is not a zero-dollar observation.
- Do not generalize a price-match opportunity into guaranteed profit. Walmart's policies exclude several promotion types and marketplace offers, and store managers retain decision authority for applicable in-store matches.

## Public evidence used

- Walmart corporate FAQ: store-to-store prices may vary; online pricing does not necessarily reflect store pricing.
- Walmart.com Terms of Use: Pickup and Delivery items use the price of the store that packs/delivers the order; prices can vary by store.
- Walmart policies/help: Marketplace/third-party offers and store prices are excluded from Walmart.com price matching; store and online price-match rules differ.
- Walmart fulfillment help: pickup/delivery eligibility depends on location and inventory.

## Integration posture

Public pages are suitable for source semantics and manual/public research. HUNTIQ should not rely on undocumented private endpoints or account-only data. Any future production API or partner integration must preserve retailer/store/seller/channel identity and follow the authorization terms in force at that time.