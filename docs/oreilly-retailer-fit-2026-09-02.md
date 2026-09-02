# O'Reilly Auto Parts retailer fit — 2026-09-02

Public-source research only; no account access used.

## Findings relevant to HUNTIQ

- O'Rewards earns 1 point per $1 on qualifying purchases, with a $5 reward issued after 150 points. Points/rewards therefore belong in deferred account value, not same-transaction cash acquisition cost.
- O'Rewards terms explicitly say points/rewards are not awarded for merchandise purchased for resale or commercial use. HUNTIQ must not count loyalty rewards in reseller economics unless eligibility is independently established for the actual intended use.
- Rewards are issued after the earning threshold is reached and generally expire 90 days after issue; accrued points expire after one year. Deferred value should carry qualification/expiration metadata and never contaminate raw shelf-price history.
- Current promotions include automatic cart discounts, bonus-point offers, gift cards after rebate, and a 10% in-store military discount. These are separate economics classes: checkout discount, deferred loyalty value, post-purchase rebate/gift card, and identity-qualified in-store discount.
- O'Reilly's rebate center currently shows manufacturer/O'Reilly gift-card and prepaid-card rebates with validity and submission deadlines. These should be modeled as deferred post-purchase value unless the discount is actually applied at checkout.

## HUNTIQ source-policy implications

1. Keep observed shelf/web price immutable in store/channel-local price history.
2. Treat automatic cart discounts as qualified acquisition economics only after cart conditions are known.
3. Treat O'Rewards points and earned rewards as zero value for resale-intended purchases unless program eligibility for that use is established; public terms currently exclude resale/commercial-use reward earning.
4. Treat rebates/gift cards as deferred value with dates, claim requirements and source evidence.
5. Military pricing requires eligibility verification and is never a universal historical price.
6. No unrestricted official public local-price/inventory developer API was established in this research pass; do not promote undocumented endpoints into production ingestion.

## Public sources
- https://www.oreillyauto.com/orewards-terms-and-conditions
- https://www.oreillyauto.com/orewards-faq
- https://www.oreillyauto.com/coupons-offers-and-promotions
- https://www.oreillyauto.com/rebate
