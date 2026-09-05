# REI retailer fit — 2026-09-05

Public-source research only. No account access or authenticated REI session was used.

## HUNTIQ rules

- Keep REI's observed shelf/web price separate from a later price adjustment. REI says it does not competitor-price-match and allows qualifying same-item REI price adjustments within 14 days of the original purchase. A possible adjustment is conditional acquisition economics, not historical shelf-price evidence.
- Treat Co-op Member Reward as deferred, account-bound value rather than cash or an immediate universal discount. REI says the typical 10% reward is not guaranteed, excludes many discounted/sale/clearance/outlet categories, is issued later, and only the primary member may redeem it.
- Do not assume a member reward for resale inventory. REI's membership terms say Promotional Rewards will not be awarded when REI reasonably believes merchandise is intended for resale or commercial use.
- Keep Re/Supply used gear separate from new-condition price history and exact-condition resale comparisons. Store pages state used-gear selection varies by store.
- Treat displayed pickup timing as estimated availability, not secured inventory. REI says estimated pickup dates are not guaranteed, depend on item location/availability, can change, and customers receive emails as items become ready.
- Preserve location and fulfillment context for pickup observations. Store/curbside pickup availability varies by location.

## Product implications

For REI opportunities, HUNTIQ should retain distinct fields for observed price, channel/location, condition (new vs Re/Supply used), membership eligibility, reward type/value, potential price-adjustment eligibility, and pickup readiness. Rewards and later adjustments can reduce effective acquisition cost only when the buyer actually qualifies; neither should overwrite the raw observed price used by price-history/anomaly evidence.

## Public sources checked

- REI Price Adjustment: https://www.rei.com/help/price-adjustment
- REI Membership Benefits & Rewards: https://www.rei.com/membership
- REI Member Loyalty Program Terms: https://www.rei.com/terms/rei-membership-program
- REI Shipping / Pickup FAQ: https://www.rei.com/help/shipping
- REI store pages / locator: https://www.rei.com/stores/map
