# Ace Hardware public retail rules — 2026-09-03

Sources reviewed: Ace Hardware customer service / Rewards terms and current acehardware.com promotional terms.

## HUNTIQ treatment

- Ace Rewards earn 10 points per $1 and convert at 2,500 points into a $5 reward. Newly earned points/rewards are deferred value, so they must not reduce raw observed shelf-price history.
- A reward already issued and actually redeemed can be recorded in transaction-specific acquisition economics, subject to eligibility/exclusions and forfeiture behavior.
- Rewards/coupons have category exclusions and can be restricted from sale/clearance merchandise. HUNTIQ must fail closed rather than assume stackability.
- Current promotions can use single-transaction thresholds, maximum discounts, member requirements, product/category eligibility, date windows, and per-member limits. These belong in conditional acquisition economics, not baseline/reference price.
- Participating-store language matters. Ace is a retailer network with participating locations, so store/channel identity should remain attached to observations and promotion eligibility.
- Some online/local delivery eligibility depends on the selected store and delivery area; fulfillment availability is evidence, not a guarantee of possession.
- Do not automate gift-card balance checking: Ace Card terms explicitly prohibit bots/crawlers/scripts for balance inquiries unless expressly authorized.

## Modeling consequences

1. Keep observed item price separate from earned future reward value.
2. Store applied reward/coupon value as a checkout/acquisition adjustment only when verified for that transaction.
3. Track promotion limits, member-only requirements and stackability as explicit constraints.
4. Preserve store identity for local offers, fulfillment and participating-retailer rules.
5. Treat clearance/sale coupon exclusions as lifecycle/economics evidence, never as a universal rule outside the current source terms.
