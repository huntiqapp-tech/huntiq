# Advance Auto Parts — public retailer fit (2026-09-02)

## Current public findings
- Advance Rewards replaced Speed Perks on 2026-02-02. Public launch materials describe tiered points (5/8/10 points per dollar) and coupon stacking up to $100 depending on tier. Treat points/rewards as account-based deferred value unless a specific reward is actually applied at checkout.
- Advance publicly advertises online-only coupon promotions with exclusions and expiration dates. These belong in qualified checkout economics for the applicable channel and transaction; they must not rewrite raw shelf-price history.
- Public same-day/pickup pages say only in-stock items qualify and pickup readiness is confirmed after ordering. Inventory visibility is therefore an observation, not guaranteed fulfillment.
- Standard ship-to-home is publicly advertised as free over a threshold, while expedited/urgent shipping depends on location/weight. Fulfillment/shipping stays in channel economics rather than product price history.
- Public rebate offers require qualifying purchases and are redeemed after purchase. Rebate value is deferred/non-cash acquisition value until actually received and should never masquerade as an immediate cash price reduction.
- Advance operates an affiliate program through Impact Radius and advertises a product catalog after acceptance. Affiliate commission must remain outside HUNTIQ ranking/anomaly logic; acceptance/terms are separate from any rights to retain or redistribute price data.

## HUNTIQ treatment
1. Preserve store/channel identity on every observation.
2. Persist only rights-cleared raw observed price as price history.
3. Keep coupon, rewards, rebate, shipping and fulfillment fields in acquisition/channel economics.
4. Treat pickup availability as fresh inventory evidence with timestamp/confidence, not guaranteed stock.
5. Do not count affiliate commission toward shopper profit or deal score.
6. Do not claim an unrestricted official public local-price/inventory API based on the public material reviewed here.
