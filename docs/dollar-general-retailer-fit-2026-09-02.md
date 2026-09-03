# Dollar General retailer fit — 2026-09-02

## Public findings
- Dollar General currently operates myDG Delivery through its own app/site and also supports marketplace delivery through DoorDash and Uber Eats. Delivery-channel fees and marketplace economics must remain separate from in-store shelf-price history.
- Dollar General's current shopping agreement says DG Delivery totals and pricing are tied to the selected retail location. Store/location identity therefore must remain attached to observations rather than being collapsed into one national price history.
- DG's public shopping-list page states pricing is based on the current store or online prices. HUNTIQ should treat `store` and `online` as distinct price-history channels.
- myDG includes personalized offers based on account/profile and purchase behavior. Those are account-dependent economics, not anonymous shelf-price history.
- Digital coupons require an active account, can impose item or multiple-purchase requirements, can expire, and may be non-stackable. They belong in qualified acquisition-cost logic with explicit eligibility, not in the raw anomaly baseline.
- Dollar General's terms prohibit sale or commercial use of myDG offers. HUNTIQ must not assume account offers are transferable or generally reseller-usable.
- DG Cash Back is deferred shopper value, not an immediate reduction in the transaction that earned it.
- DoorDash DG orders are not tied to the customer's Dollar General account, do not accept DG coupons, and can be partially fulfilled or substituted. DoorDash availability is therefore fulfillment evidence, not proof of exact physical shelf inventory.
- Dollar General's terms acknowledge pricing errors can occur in DG GO contexts. Extreme/penny-like anomalies should remain verification-sensitive rather than being treated as guaranteed checkout prices from an app/web observation alone.
- Dollar General publicly advertises an affiliate program with tracked links and a stated 5% commission, but its affiliate page says affiliates should not list product prices because availability, discounts and prices change frequently. Affiliate economics remain outside HUNTIQ ranking and do not create price-retention permission.
- No unrestricted official public local-store price/inventory developer API was identified during this research pass.

## HUNTIQ modeling rules
1. Keep in-store, online, myDG Delivery, DoorDash and other third-party delivery acquisition economics separate.
2. Preserve store/location identity for DG observations and do not merge online/store history baselines.
3. Keep personalized myDG offers and digital coupons outside anonymous historical baselines unless eligibility/context is explicitly recorded.
4. Treat delivery/pickup availability as fulfillment evidence rather than exact shelf-count inventory.
5. Treat delivery and expedite fees as channel costs rather than raw shelf price.
6. Treat DG Cash Back as deferred value and include it only after offer qualification is known.
7. Basket/order-level discounts must be allocated across qualifying item spend; never assign the full reward to one SKU.
8. Require stronger checkout or user verification before high-urgency alerts on extreme DG anomalies or penny-like prices.
9. Quantity recommendations must account for partial fulfillment and should not infer that orderable quantity equals confirmed physical stock.
10. Affiliate payout never influences anomaly score, resale score, profit ranking or alert priority.
11. Affiliate permission is not data-retention permission. Public prices still require a rights-cleared ingestion route before production persistence/redistribution.

## Production blockers
- Affiliate links require program application/acceptance and agreement review.
- A rights-cleared retailer data route is still required before production local-price/inventory history can be claimed.

## Public sources checked
- https://www.dollargeneral.com/terms-and-conditions
- https://prod.dollargeneral.com/shopping-list
- https://www.dollargeneral.com/mydg
- https://www.dollargeneral.com/doordash
- https://prod.dollargeneral.com/terms-and-conditions
