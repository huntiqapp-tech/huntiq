# Dollar General retailer fit — 2026-09-02

## Public findings
- Dollar General currently operates myDG Delivery through its own app/site and also supports marketplace delivery through DoorDash and Uber Eats. Delivery-channel fees and marketplace economics must remain separate from in-store shelf-price history.
- DG Cash Back offers are selected by customers and redeemed toward future in-store purchases. They are deferred shopper value, not an immediate reduction of the transaction that earned them.
- Dollar General publicly advertises an affiliate program with tracked links and a stated 5% commission, but its affiliate page explicitly says affiliates should not list Dollar General product prices because availability, discounts and prices change frequently. Affiliate economics must remain outside HUNTIQ ranking and cannot be treated as authorization to persist retailer price history.
- The affiliate program requires application/acceptance and a legal agreement before monetized routing can be used.
- No unrestricted official public local-store price/inventory developer API was identified during this research pass.

## HUNTIQ modeling rules
1. Keep in-store, myDG Delivery, DoorDash and other delivery-channel acquisition economics separate.
2. Treat delivery and expedite fees as channel costs rather than raw shelf price.
3. Treat DG Cash Back as deferred value and include it only after offer qualification is known.
4. Basket/order-level discounts must be allocated across qualifying item spend; never assign the full reward to the SKU currently being evaluated.
5. Affiliate payout never influences anomaly score, resale score, profit ranking or alert priority.
6. Affiliate permission is not data-retention permission. Publicly visible prices still require a rights-cleared ingestion route before production history persistence.

## Production blockers
- Affiliate links require program application/acceptance and agreement review.
- A rights-cleared retailer data route is still required before production local-price/inventory history can be claimed.
