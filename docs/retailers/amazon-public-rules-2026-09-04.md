# Amazon public retailer rules — 2026-09-04

Research refreshed from Amazon public pricing/help material and Amazon's 2026 reference-pricing announcement. No customer account, Seller Central login, order history, or private endpoint was used.

## HUNTIQ modeling rules

- Treat Amazon **List Price / reference price** as reference evidence, not a guaranteed recent transaction price. Amazon says List Price can be validated from a recent offer at another retailer or a Featured Offer purchase at that price.
- When Amazon exposes its Price history graph, model that series specifically as the **lowest Featured Offer price for each day**, not as every seller's price, an average selling price, or a guaranteed in-stock acquisition price.
- Preserve seller / offer identity where available. Amazon marketplace offers can come from Amazon or third-party merchants with different fulfillment, return, inventory, and mispricing behavior.
- Treat Amazon's **Typical Price / Was Price** as a derived reference statistic rather than raw price history. Amazon describes it as a median based on recent paid prices, with 2026 rules that can include promotional sales under defined conditions.
- Do not assume displayed price is locked before order placement. Amazon's public business pricing policy says prices change continually and, for items sold by Amazon, price confirmation occurs when the order is placed; mispriced items can be canceled or require customer approval of a higher price.
- Keep business-only prices, quantity discounts, Subscribe & Save, Prime-exclusive prices, negotiated pricing, coupons, and similar entitlement/promotion prices scoped to their eligibility context. They must not become universal shelf-price observations.
- For resale modeling, do not treat an Amazon reference-price markdown as proof of resale value. HUNTIQ should continue using completed-sale evidence and product-identity-matched comps for exit value.
- For anomaly scoring, a drop against List Price alone must not receive the same confidence as a drop against timestamped observed Featured Offer history.

## Public sources reviewed

- Amazon 2026 reference pricing update (News_Amazon): https://sellercentral.amazon.com/seller-forums/discussions/t/f48a1fe5-aa8e-4806-b687-2d9aeec5c351
- Amazon Business Pricing Policy: https://digprjsurvey.amazon.com/csad/help/node/GUKKCM63WPRVL86G
- Amazon Return Policy: https://digprjsurvey.amazon.com/csad/help/node/GKM69DUUYKQWKWX7
