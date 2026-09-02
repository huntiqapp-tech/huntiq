# GameStop retailer fit — 2026-09-02

Public-source research only. No account access or restricted endpoints used.

## Current program rules relevant to HUNTIQ

- GameStop's current Pro & Account Terms are effective July 15, 2026.
- GameStop expressly says entities or persons are prohibited from using the Pro Program for profit. HUNTIQ must therefore never assume Pro discounts, points, monthly rewards, or other membership value in reseller economics.
- GameStop reserves the right to limit product quantities and change product pricing without notice. Multi-unit opportunity sizing should treat quantity as uncertain unless availability/limits are confirmed.
- The $5 Pro Monthly Reward is account-linked, once per month, non-stackable with other promotions, and has category exclusions. Even for non-resale consumer use it is qualified checkout economics, never raw shelf-price history.
- Pro free shipping currently requires a $54+ qualifying order after discounts and excludes selected categories. Shipping benefit belongs in customer-qualified fulfillment economics, not price history.
- Effective July 15, 2026, points earning through Pro membership is being phased out; qualifying Pro credit-card holders can still earn points. This reinforces that points are account/payment-method/deferred value rather than universal acquisition-price reductions.
- Reward certificates and offers can have per-account/day limits and product exclusions. HUNTIQ should persist explicit limits and keep unpublished limits unknown rather than assuming repeatability.

Source reviewed: https://www.gamestop.com/TermsConditions.html

## HUNTIQ implementation posture

1. Keep public observed product price immutable and separate from membership, coupon, trade-credit, reward, and shipping economics.
2. For reseller-intended opportunities, assign GameStop Pro-derived value zero unless future terms explicitly permit for-profit use.
3. Preserve quantity-limit uncertainty for multi-unit purchases.
4. Never use trade-in credit as a completed third-party resale comp; it is a distinct exit channel with its own terms.
5. No unrestricted official public local price/inventory API was established in this pass.