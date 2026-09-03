# REI retailer-fit research — 2026-09-03

Public-source research only. No authenticated account access was used.

## Verified public rules
- REI says it does **not** price match competitors. Its own price-adjustment requests are generally limited to 14 days and require the same product, color and size. REI Outlet items ending in `$0.73` are excluded from that adjustment program.
- REI promotional/member rewards are future account value, not an immediate shelf-price reduction. Program terms say promotional rewards can be used on future purchases and are applied after tax and discounts when redeemed.
- REI program terms explicitly say promotional rewards will not be awarded when REI reasonably believes merchandise is intended for resale or commercial use.
- Sale, clearance, discounted, Outlet and other listed categories can be excluded from annual-purchase reward calculations.
- Current Labor Day 2026 public promotions include member-only Outlet discounts with explicit dates/coupon requirements. These must be represented as conditional checkout economics and must never contaminate raw price history.
- REI publicly offers buy-online/pick-up-in-store. Pickup eligibility is fulfillment evidence, not a guarantee of shelf inventory until readiness is confirmed.

## HUNTIQ modeling implications
1. Keep regular REI retail, REI Outlet, and used/Re/Supply channels distinct where economics and rules differ.
2. Never use competitor price matching to reduce REI acquisition cost because REI publicly says it does not competitor-price-match.
3. Treat coupons/member discounts as conditional acquisition economics requiring confirmed eligibility, dates, channel and coupon conditions.
4. Treat annual/promotional rewards as deferred value, not cash paid today. For resale-oriented purchases, default reward value to zero because REI terms allow exclusion when merchandise is intended for resale/commercial use.
5. Keep Outlet/clearance markers out of the ordinary-price baseline when they represent a different channel or conditional promotion.
6. Treat pickup availability as execution evidence with freshness; a ready-for-pickup confirmation is stronger than simple pickup eligibility.
7. Affiliate economics, if added later, remain separate from deal ranking and Flip Score.

## Sources
- https://www.rei.com/help/price-adjustment
- https://www.rei.com/terms/rei-membership-program
- https://www.rei.com/promotions/coupons
- https://www.rei.com/newsroom/article/rei-announces-labor-day-sale-with-deals-to-close-out-summer-and-gear-up-for-fall

Research checked 2026-09-03. Revalidate before production integration because retailer promotions and terms can change.
