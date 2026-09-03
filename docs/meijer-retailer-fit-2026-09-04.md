# Meijer retailer fit — 2026-09-04

## Public findings

- Meijer pickup is store-selected, supports pickup in as little as about four hours, and is free on qualifying orders of $35+. This makes store context and fulfillment mode part of the observation identity rather than global product metadata.
- Meijer states that pickup/delivery items have no markup and can receive the same sales/promotions offered in store. HUNTIQ can therefore compare store and digital offers, but must still record channel/store provenance and actual checkout eligibility.
- mPerks points are earned after qualifying transactions and later converted into rewards. Newly earned mPerks value is deferred value and must not reduce raw shelf-price history.
- Coupons can be single-use and product availability can vary by store. Coupon value belongs in conditional acquisition economics only after eligibility is known.
- Credit-card rewards are also issued later and have expiration/exclusion rules; they are not baseline price reductions.

## HUNTIQ modeling rules

1. Preserve store/location and fulfillment channel on every Meijer observation.
2. Keep observed item price separate from clipped mPerks coupons, future mPerks earnings, credit-card rewards, and delivery/pickup incentives.
3. Treat promotion stacking as conditional until checkout evidence confirms eligibility.
4. Do not infer inventory certainty from pickup availability alone; use it as fulfillment evidence with a freshness timestamp.

## Public sources

- https://www.meijer.com/shopping/services/more-ways-to-meijer.html
- https://www.meijer.com/terms.html/1000
- https://www.meijer.com/shoppable-ad/placeholder.html
- https://www.meijer.com/shopping/services/credit-card.html
- https://newsroom.meijer.com/2026-06-25-Meijer-Cuts-Prices-on-More-Than-100-Summer-Staples-by-Up-to-50-Percent
