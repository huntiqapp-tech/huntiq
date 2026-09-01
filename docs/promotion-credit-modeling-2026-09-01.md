# Retail promotion / credit modeling research — 2026-09-01

## Product rule
HUNTIQ must distinguish three categories that look similar to customers but behave differently in economics:

1. **Instant checkout discount** — lowers the price paid now and therefore lowers cash invested.
2. **Checkout credit / coupon** — also lowers the amount paid now when actually applied to the transaction.
3. **Future rebate / store credit** — does **not** lower today's cash outlay. It may contribute a discounted expected value only when its terms, redemption window and likelihood of use are understood.

`lib/acquisition-cost.js` implements this separation. Channel economics uses cash outlay for the primary ROI denominator and exposes economic ROI separately.

## Kohl's Cash
Public Kohl's help pages say Kohl's Cash is earned during specified earning periods, is earned after applicable coupons and before tax, is not legal tender, has a stated redemption window, excludes categories/services, and can be reduced or voided when qualifying merchandise is returned. Expired Kohl's Cash cannot be redeemed.

HUNTIQ implication:
- Treat newly earned Kohl's Cash as a **future store credit**, not a discount on the purchase that earned it.
- Use a realization rate below 100% unless the user explicitly values/redeems it reliably.
- Preserve expiration/redemption-window metadata where a lawful source provides it.
- Do not count the same Kohl's Cash both as acquisition savings and again on a later purchase.
- Returns can claw back or reduce the earned value, so resale economics should not assume the credit is irrevocable.

Official references:
- https://www.kohls.com/faq/article/95
- https://www.kohls.com/faq/article/893
- https://www.kohls.com/faq/article/1188

## Harbor Freight coupons / Inside Track Club
Harbor Freight's public coupon pages distinguish ordinary coupon discounts and Inside Track Club member prices. Public terms commonly state that qualifying percentage-off coupons are applied at checkout/register, may be single-use or quantity-limited, may exclude categories, may not stack with other offers, and member-exclusive offers require an active Inside Track Club membership.

HUNTIQ implication:
- A verified coupon actually applicable to the item can be modeled as an **instant discount**.
- Member-only pricing must carry an eligibility requirement rather than being shown as universally available.
- Coupon stacking must default to false unless terms explicitly allow it.
- An advertised `Compare to` price is not store-local historical price evidence and must not be used as the price-history baseline.

Official references:
- https://go.harborfreight.com/10-off-any-single-item-just-for-you/
- https://go.harborfreight.com/inside-track-club-member-prices/

## Alert rule added in v0.9.27
If a positive resale opportunity depends on deferred retailer credit to remain profitable, the evidence gate adds `deferred-credit-dependent` and caps an otherwise `instant` alert at `standard`. This keeps urgent alerts focused on deals whose economics stand on today's cash transaction rather than uncertain future store value.
