# Northern Tool + Equipment — HUNTIQ retailer fit

Research date: 2026-09-02

## Public findings

- Northern Tool operates a public affiliate program through CJ. Affiliate economics are monetization only and must never influence deal ranking, anomaly score, or alert priority.
- Northern Tool's public site currently advertises order-threshold e-gift-card promotions. The gift card is issued after the qualifying order ships or is picked up, has an expiration date, excludes some categories/items, and cannot be combined with some other promotions.
- Therefore, an earned gift card is deferred retailer value, not an immediate reduction in cash acquisition cost.
- Qualification thresholds must be evaluated at the order level. HUNTIQ must not allocate a threshold reward to a single item unless the full basket qualifies and the reward allocation method is explicitly modeled.
- Northern Tool also advertises an in-store military discount requiring valid military ID, with exclusions and non-stacking restrictions. This is shopper-specific qualification and cannot be treated as an unconditional shelf price.
- Public store pages support local-store discovery and pickup. Inventory/availability observations should remain location- and channel-specific and should not be presented as fulfillment guarantees.

## HUNTIQ modeling rules

1. Keep observed shelf/web price immutable and separate from shopper-specific discounts.
2. Treat threshold gift cards as `futureCredit`, not `instantDiscount`.
3. Apply threshold rewards only after basket qualification is proven; record threshold, excluded items, validity window, stacking restrictions, and expiration.
4. Keep in-store military pricing separate from general price history because eligibility requires identity verification at purchase.
5. Affiliate commissions remain outside opportunity scoring.
6. Do not use undocumented/private endpoints as a production data source. Public product pages may support research only subject to applicable terms and retention/redistribution rights.

## Product implication

Northern Tool strengthens the need for basket-aware promotion economics. A $10 future gift card on an order over $100 cannot be modeled as a $10 reduction to one item's raw historical price. HUNTIQ should preserve cash outlay, deferred reward value, and order-level qualification as separate fields.
