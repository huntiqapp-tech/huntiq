# Sam's Club public retailer-fit research — 2026-09-03

Public-source pass only; no member account access was used.

## HUNTIQ modeling rules

1. **Club/location identity is required.** Sam's Club terms state that prices, unit prices and available quantities may vary by Club and date. HUNTIQ should therefore keep club-local price histories isolated instead of creating one national baseline.
2. **Pickup/orderability is not verified inventory.** Curbside orders are subject to availability, and Sam's Club does not guarantee that all requested goods will be provided. Pickup eligibility is a fulfillment signal, not proof of shelf quantity.
3. **Direct Delivery from Club can share the club price.** Sam's Club's current Delivery from Club FAQ says there are no price markups and members pay the same price as in-club/Curbside/online for that service. Delivery fees remain fulfillment costs and must stay outside raw item price history.
4. **Instacart is a separate channel.** Sam's Club says Instacart online prices are higher than in-club and members can receive lower Instacart prices than non-members. Instant Savings are not available through Instacart. HUNTIQ must not blend Instacart observations into direct-club price history.
5. **Membership/reward value is conditional economics.** Sam's Cash can be redeemed on eligible purchases, but earning/redemption depends on membership/account rules. It must not reduce anonymous public shelf price unless the value is actually qualified and usable for the shopper.
6. **Weighted goods need final-price caution.** Fresh weighted items are charged using the applicable unit price and actual fulfilled weight, so a pre-authorization maximum is not the final acquisition cost.
7. **Quantity recommendations remain conservative.** Pickup orders are explicitly limited by the Sam's Club Merchandise Policy, so HUNTIQ should not assume every displayed/requested quantity will be fulfilled.

## Public sources

- Sam's Club Terms and Conditions: https://help.samsclub.com/app/answers/detail/a_id/4075
- Curbside Pickup FAQ: https://help.samsclub.com/app/answers/detail/a_id/3980
- Delivery From Club FAQ: https://help.samsclub.com/app/answers/detail/a_id/4034
- Instacart Home Delivery from Sam's Club: https://help.samsclub.com/app/answers/detail/a_id/2829
- Sam's Cash FAQ: https://help.samsclub.com/app/answers/detail/a_id/4092

## Implementation implication

Model `sams_club_direct`, `sams_club_pickup`, `sams_club_delivery`, and `sams_club_instacart` as distinct channel identities where source semantics differ. Keep delivery fees, membership rewards and account-dependent savings in acquisition/fulfillment economics rather than raw price-history baselines.