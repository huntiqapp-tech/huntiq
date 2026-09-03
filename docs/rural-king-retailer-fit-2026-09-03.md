# Rural King retailer fit — 2026-09-03

Public-source research only. No account access, credentials, private APIs, or authenticated retailer data were used.

## Findings

- Rural King Rewards is open only to eligible members who are **not resellers**. Its public terms define a reseller as an individual or company buying Rural King goods with the intention of selling them to the public. HUNTIQ therefore must not count Rural King Rewards earnings in reseller economics by default.
- Rewards accrue at 1 point per $1 on qualifying purchases and a $5 reward is issued after 500 points / $500 spent. That is deferred value, not an immediate shelf-price reduction unless an already-issued reward is actually redeemed at checkout.
- Rural King publishes store-selected inventory counts on product pages. These counts are useful as timestamped availability evidence, but HUNTIQ should still treat them as observations rather than guarantees.
- Rural King's current price-match policy requires identical product identity and a qualifying local competitor within 30 miles, with verification by Rural King. Clearance, closeout, used/refurbished/open-box, member-only, wholesale/volume, pricing-error, auction and many third-party marketplace prices are excluded. Price-match value belongs in transaction-specific acquisition economics only after qualification; it must never enter raw Rural King shelf-price history.
- Rural King distinguishes ordinary markdowns from clearance: its Pricing Promise says some items are dropping in price without being discontinued, while clearance items are permanently marked down to sell out/discontinue. HUNTIQ should preserve this distinction because persistent ordinary markdowns and terminal clearance have different anomaly/urgency behavior.

## HUNTIQ modeling rules

1. Keep store-selected Rural King prices/inventory isolated by location and channel.
2. Treat inventory count as time-stamped execution evidence, not guaranteed stock.
3. Do not include unredeemed Rural King Rewards in acquisition cost or ROI.
4. For resale-oriented HUNTIQ use, default newly earned Rural King Rewards value to zero because the public loyalty terms exclude resellers.
5. Keep approved price matches separate from historical shelf-price observations.
6. Preserve retailer-marked clearance state separately from ordinary markdown state; do not assume every persistent low price is a fresh anomaly.
7. Exclude affiliate economics from ranking and Flip Score.

## Public sources reviewed

- Rural King Rewards: https://www.ruralking.com/rewards
- Rural King Loyalty Terms & Conditions: https://www.ruralking.com/loyalty-rewards-terms-conditions
- Rural King price-match help article (updated April 1, 2026): https://help.ruralking.com/hc/en-us/articles/33686754265485-Will-Rural-King-honor-price-matches-in-store-and-online
- Rural King FAQ / store inventory behavior: https://www.ruralking.com/faq
- Rural King Pricing Promise: https://www.ruralking.com/pricing-promise
