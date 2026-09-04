# Sam's Club public retailer rules — 2026-09-04

Research refreshed from Sam's Club public Help pages. No member account, login-only purchase history, or private endpoint was used.

## HUNTIQ modeling rules

- Keep price history bound to **club + date + channel**. Sam's Club states that prices, unit prices, and available quantities can vary by club and date.
- Treat Curbside Pickup as **local fulfillment evidence, not secured inventory**. Pickup items are subject to club inventory and availability is not guaranteed; customers receive a separate ready-for-pickup notice after the initial order confirmation.
- Preserve the price-lock moment. For prepaid Curbside Pickup, the online price is determined when the order is placed; weighted items can still settle to the actual purchased weight.
- Keep **Instant Savings / Special Buy / New Lower Price** observations promotion-scoped. Pickup promotional prices apply only during their specified pricing periods, and Instant Savings can vary by club/location and channel.
- Treat membership-linked Instant Savings as **account/membership-context economics**, not a universal shelf-price baseline. Eligibility requires an active membership and offers can be club-only or online-only.
- Separate Sam's Club direct Delivery From Club from Instacart. Sam's Club says Delivery From Club uses the same merchandise price as club/Curbside/online, while its Instacart channel can have different promotions, fees, and member vs non-member pricing context.
- Delivery, service, busy-pricing, tips, and similar fulfillment charges are acquisition/fulfillment costs and must never be stored as merchandise price observations.
- Do not assume pickup completion merely from an authorization or order placement. A card hold can exist before the order is actually picked up, and unavailable items may be omitted/canceled.

## Public sources reviewed

- Sam's Club Curbside Pickup Terms & Conditions: https://help.samsclub.com/app/answers/detail/a_id/4075
- Sam's Club Curbside Pickup FAQ: https://help.samsclub.com/app/answers/detail/a_id/3980
- Sam's Club Curbside Pickup Purchases: https://help.samsclub.com/app/answers/detail/a_id/457
- Sam's Club Curbside Pickup Prices and Availability: https://help.samsclub.com/app/answers/detail/a_id/347
- Sam's Club Delivery From Club FAQ: https://help.samsclub.com/app/answers/detail/a_id/4034
- Sam's Club Instant Savings Program: https://help.samsclub.com/app/answers/detail/a_id/520
- Sam's Club Instacart Home Delivery: https://help.samsclub.com/app/answers/detail/a_id/2829
