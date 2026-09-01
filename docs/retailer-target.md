# Target public retailer semantics

Research date: 2026-09-01.

## Publicly confirmed behavior

- Target states that prices, promotions, styles, and availability may vary by store and online.
- Same Day Delivery uses the same item pricing as the shopper's local/set Target store for applicable items.
- Target's price-match guidance says online clearance pricing is separate from in-store clearance pricing, and in-store clearance prices are not visible online.
- Order Pickup is store-scoped and commonly ready within a few hours, so availability observations must retain the selected store/location and timestamp.

## HUNTIQ normalization rules

1. Never merge Target online and physical-store clearance into one baseline.
2. Key store-scoped observations by retailer + item identifier + store/location + condition + fulfillment channel.
3. Treat Same Day Delivery prices as local-store observations, not national online observations.
4. Do not infer an in-store clearance price from an online clearance price or vice versa.
5. Preserve pickup/delivery availability separately from price so an unavailable item does not become a false price event.
6. Personalized/member discounts should be represented separately from public base price unless their eligibility is universal and automatically applied.

## Collection status

This document records public price and fulfillment semantics only. It does not authorize automated scraping. Production collection remains disabled unless HUNTIQ has a clearly permitted API/feed/provider or other lawful collection path.

## Sources

- Target Help — Same Day Delivery: https://www.target.com/help/articles/delivery-options/same-day-delivery
- Target Help — Price Match Guarantee: https://www.target.com/help/articles/policies-guidelines/price-match-guarantee
- Target Help — Order Pickup: https://www.target.com/help/article/000062559
