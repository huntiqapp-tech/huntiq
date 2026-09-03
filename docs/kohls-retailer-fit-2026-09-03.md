# Kohl's retailer fit — 2026-09-03

Public-policy research only. No account access, checkout automation, or authenticated scraping was used.

## HUNTIQ modeling rules

- Keep Kohl's store and Kohls.com price histories separate. Kohl's states that store prices can differ from Kohls.com and that merchandise/promotions may vary by channel.
- Treat an approved price match as acquisition/checkout economics, not as a raw shelf-price observation. Store matching and Kohls.com matching have different verification rules, coupons generally cannot be stacked on a price-matched item, and Kohl's may limit quantity.
- A suspected pricing error is an anomaly, not a guaranteed executable deal. Kohl's reserves the right to correct incorrect prices and refuse or cancel orders even after confirmation.
- Store-pickup availability alone is not sufficient execution evidence. Inventory can disappear before an associate pulls the order. A Ready for Pickup / fulfilled state is materially stronger evidence and is when Kohl's says the charge is made.
- A later price adjustment is a post-purchase acquisition outcome rather than a historical shelf-price replacement. Qualifying adjustments generally use a two-week window; clearance markdowns and BOGO transactions are excluded.
- Kohl's Cash and Rewards are deferred retailer value, not cash-equivalent purchase-price reductions until actually earned/usable under the applicable terms.

## Public sources checked

- Price Match Policy: https://www.kohls.com/faq/article/90
- Pricing & Product Information: https://www.kohls.com/faq/article/85
- Price Adjustments: https://www.kohls.com/faq/article/88
- Canceled Orders: https://www.kohls.com/faq/article/694
- Store Pickup FAQ: https://www.kohls.com/faq/article/1169

## Product implications

Kohl's is useful to HUNTIQ, but channel identity, fulfillment state, promotion treatment, quantity caps, and order-error risk must stay explicit. Urgent alerts should prefer a fresh retailer observation plus stronger execution evidence instead of treating a visible pickup button or dramatic price alone as proof the deal can be completed.
