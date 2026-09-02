# DICK'S Sporting Goods — HUNTIQ retailer fit (2026-09-02)

Public-source research only. No account access or undocumented/private endpoints were used.

## Channel separation

DICK'S states that products, pricing, promotions, exclusions and availability may vary between in-store and online and may change without notice. HUNTIQ must therefore keep store and online observations in separate history keys and must not use an online price as a local-store baseline.

Source: https://www.dickssportinggoods.com/s/product-availability-price

## Availability / fulfillment

Product-page availability is a fulfillment estimate, not proof that a unit is physically present or reserved. One-hour curbside/in-store pickup is subject to product availability and exclusions. HUNTIQ should treat pickup readiness as a fulfillment observation with timestamp/confidence, not guaranteed inventory.

Sources:
- https://www.dickssportinggoods.com/s/product-availability-price
- https://www.dickssportinggoods.com/

## Pricing errors and anomaly confidence

DICK'S reserves the right to cancel orders related to pricing errors. Extreme price anomalies can still be surfaced, but customer-facing urgency should require checkout/fulfillment confirmation and retain cancellation risk in the alert explanation.

Source: https://www.dickssportinggoods.com/s/product-availability-price

## Promotions / ScoreCard

Public pages advertise ScoreCard earning at one point per $1 and a $10 Reward for every 300 points. Rewards are account/deferred value and must not reduce anonymous acquisition cash cost unless already available and applicable at checkout. ScoreCard+ and credit-card rewards are qualification/payment-dependent and remain separate from raw price history.

Source: https://www.dickssportinggoods.com/

## Coupon / promotion exclusions

DICK'S says select new-release/specified products can be excluded from price promotions due to manufacturer restrictions and coupon-code restrictions apply. HUNTIQ should model public coupons as conditional promotions until product/channel/account eligibility is established.

Source: https://www.dickssportinggoods.com/s/return-policy

## HUNTIQ implementation rules

1. Keep in-store and online observations isolated.
2. Do not treat pickup availability as guaranteed on-hand inventory.
3. Pricing-error anomalies may rank as opportunities, but should carry cancellation/confirmation risk.
4. ScoreCard/ScoreCard+/credit-card rewards are conditional or deferred value, not raw-price reductions.
5. Coupon/offer prices enter acquisition economics only after qualification; they never become raw shelf-price history.
6. No unrestricted official public local price/inventory API was established in this public research pass. Do not use undocumented/private endpoints.
