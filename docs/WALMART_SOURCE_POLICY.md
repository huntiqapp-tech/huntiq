# Walmart public source policy

Researched from Walmart public help, corporate FAQ, policies, and current Terms of Use; refreshed September 4, 2026.

## HUNTIQ rules

- Keep Walmart store observations store-scoped. Walmart states prices can vary from store to store because stores manage local inventory and may clear overstock or respond to local competition.
- Keep Walmart.com pricing separate from physical-store pricing. Walmart states website merchandise/prices do not necessarily reflect store merchandise/prices.
- For Walmart Pickup and Delivery, preserve the packing store identity. Walmart's current Terms say Pickup and Delivery pricing is the same as the store that packs and delivers the order, but prices can differ across stores.
- Keep Walmart Marketplace third-party sellers separate from Walmart first-party retail offers. Never mix marketplace seller price history with Walmart-owned inventory baselines.
- Preserve fulfillment channel and seller identity for shipping, pickup, store delivery, and marketplace offers. Delivery/Express fees are acquisition costs, not merchandise-price observations.
- Treat local availability as time- and location-sensitive evidence. Availability can change during the day; a product that is unavailable is not a zero-dollar observation and a displayed pickup option is not secured inventory.
- Treat substitutions as a different product identity unless the substitute resolves to the same exact SKU/GTIN/variant. Walmart says unavailable pickup/delivery items may be replaced with another item and the customer is charged the substitute's price.
- Do not generalize a price-match opportunity into guaranteed profit. For U.S. store purchases Walmart may match an identical in-stock Walmart.com item, but restrictions apply, some transactions require supervisor approval, quantities can be limited, and the store manager has final decision authority.
- Never treat another Walmart store's price as a transferable acquisition price. Walmart's current policy explicitly excludes price matching from other Walmart or Neighborhood Market stores.
- Exclude Walmart Marketplace/third-party seller prices, clearance, Rollback, Black Friday/Cyber Monday and other limited-time promotion prices from any assumed price-match path unless the exact current policy explicitly permits them.

## Public evidence used

- Walmart corporate FAQ: store-to-store prices may vary; online pricing does not necessarily reflect store pricing.
- Walmart.com Terms of Use: Pickup and Delivery items use the price of the store that packs/delivers the order; prices can vary by store.
- Walmart policies/help: in-store Walmart.com price matching requires an identical item currently in stock, excludes marketplace sellers, many promotions and other Walmart stores, and remains subject to store approval.
- Walmart fulfillment help: pickup availability depends on selected location and local inventory, which can change during the day.
- Walmart substitution help: out-of-stock pickup/delivery items may be substituted and the customer is charged the price of the item actually received.

## Integration posture

Public pages are suitable for source semantics and manual/public research. HUNTIQ should not rely on undocumented private endpoints or account-only data. Any future production API or partner integration must preserve retailer/store/seller/channel identity and follow the authorization terms in force at that time.
