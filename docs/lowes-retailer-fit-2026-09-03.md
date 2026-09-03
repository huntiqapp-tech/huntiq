# Lowe's retailer fit — public rules research (2026-09-03)

## HUNTIQ modeling implications

- Lowe's explicitly says stores do not price-match other Lowe's store locations, and Lowes.com does not price-match across ZIP codes. HUNTIQ must keep Lowe's price history isolated by store/ZIP and channel rather than treating a price as nationally fungible.
- Lowe's Price Promise excludes clearance, seasonal, closeout, damaged, open-box and advertising-error/misprint prices. Extreme clearance/anomaly observations can still be surfaced, but they should not be modeled as price-matchable or guaranteed.
- Lowe's reserves the right to limit price-match requests to reasonable quantities. Quantity recommendations therefore need a fulfillment/quantity-risk warning rather than assuming unlimited execution.
- Same-day pickup depends on store availability. Pickup eligibility is useful fulfillment evidence but must not be represented as guaranteed shelf quantity.
- MyLowe's Rewards and MyLowe's Pro Rewards introduce account-qualified value. MyLowe's Money, member deals, card discounts and Pro rewards must remain separate from anonymous shelf/online acquisition cost unless the user is actually eligible and the benefit is usable for that transaction.
- Current public MyLowe's Rewards material describes a 5% eligible-purchase discount for qualifying Lowe's cardholders; it cannot be combined with other discounts. HUNTIQ should model it as a conditional tender/account adjustment, not a public price.
- MyLowe's Money is deferred wallet value with expiration. It should not reduce raw historical item price; if modeled in economics, it belongs in a separate future-value/reward bucket with qualification and expiry metadata.

## Public sources

- Lowe's Price Promise: https://www.lowes.com/l/about/price-promise
- Shipping and Delivery Options: https://www.lowes.com/l/help/shipping-delivery
- MyLowe's Rewards: https://www.lowes.com/l/about/mylowes-rewards
- MyLowe's Money: https://www.lowes.com/l/shop/mylowes-money-days
- MyLowe's Pro Rewards: https://www.lowes.com/l/Pro/pro-benefits

## Data-rights posture

This document records public product and policy behavior only. It does not establish authorization to scrape, retain or redistribute Lowe's product data. Any production retailer adapter must separately record source rights, retention policy and redistribution permission before observations are promoted into permanent HUNTIQ history or customer alerts.
