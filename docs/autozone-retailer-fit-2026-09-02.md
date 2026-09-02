# AutoZone retailer fit — 2026-09-02

## Public findings

- AutoZone Rewards currently awards a $20 reward after five qualifying purchases of $20 or more. The reward is issued to the member account after qualification and is intended for a later purchase, so HUNTIQ must model it as deferred account value rather than an immediate reduction to the transaction that earned it.
- Qualifying Rewards activity is account/member dependent. HUNTIQ must not assume reward eligibility for an unidentified shopper.
- AutoZone supports free same-day store pickup subject to availability. The customer should wait for the ready-for-pickup confirmation; therefore a product-page availability observation is not equivalent to confirmed fulfillment.
- AutoZone currently advertises channel-specific promotions such as online Ship-to-Home coupon discounts with product/category exclusions and order thresholds. These belong in qualified channel acquisition economics, not the raw store-local shelf-price history.
- Shipping eligibility and delivery thresholds belong to channel economics and must not alter the observed item price.

## HUNTIQ modeling rules

1. Keep in-store, store-pickup, same-day delivery and ship-to-home channel economics separate when price, fees or promotion eligibility differ.
2. Store pickup inventory remains an observation until an order-ready confirmation exists.
3. Rewards earned by a transaction are deferred value. They do not reduce cash paid today or the raw historical shelf price.
4. Coupon savings enter acquisition cost only when the order channel, threshold, code/application state and item exclusions are satisfied.
5. Personalized/member offers are eligibility-dependent and receive zero optimistic value while eligibility is unknown.
6. Affiliate/marketing permission, if later obtained, must remain separate from price-history persistence and redistribution rights.

## Integration status

No unrestricted official public AutoZone local price/inventory API was established during this public research pass. HUNTIQ should not depend on undocumented endpoints. A production adapter should require a rights-cleared source with explicit persistence/redistribution terms before its observations are promoted into permanent history.