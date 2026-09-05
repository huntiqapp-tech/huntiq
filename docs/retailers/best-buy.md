# Best Buy — HUNTIQ public retailer modeling notes

Reviewed: 2026-09-05

## Current public-source observations

- Best Buy says pricing can vary among retail stores and BestBuy.com, can vary regionally, and may change during the day. HUNTIQ should therefore keep Best Buy price history scoped by store/region/channel rather than assuming one national baseline.
- Best Buy's current Price Match Guarantee requires an identical new item (matching brand, model number and color) that is immediately available from a qualified competitor and excludes Marketplace sellers, clearance, refurbished, open-box, pricing errors, coupons, bundles, limited-quantity/out-of-stock items and select-group pricing.
- Best Buy says it matches its own online/app prices in store and its in-store prices online/app, subject to policy terms. Any successful match remains conditional acquisition economics and is not evidence that every store historically offered that price.
- Store Pickup is not treated as secured inventory until Best Buy sends the ready-for-pickup notification. Displayed pickup availability remains timestamped fulfillment evidence.
- Open-box, clearance and outlet inventory must remain separate condition/channel evidence. They cannot inherit new-item resale comps or raw new-item price history without exact condition-aware matching.

## HUNTIQ rules

1. Scope Best Buy price history by store/region/channel and product condition.
2. Keep MSRP/reference pricing out of real-market-value calculations unless supported by actual completed-sale evidence.
3. Treat price matches and member/select-group offers as conditional acquisition economics, not universal historical prices.
4. Require exact brand/model/color/condition identity before sharing history or resale comparisons.
5. Treat pickup availability as an observation until a ready state is independently established.

## Public sources

- Best Buy Pricing Help & Information (effective 2025-01-24): https://www.bestbuy.com/site/help-topics/pricing-message/pcmcat748302046647.c?id=pcmcat748302046647
- Best Buy Price Match Guarantee (effective 2026-01-16): https://www.bestbuy.com/site/help-topics/price-match-guarantee/pcmcat290300050002.c
- Best Buy fulfillment overview, published 2025-12-04: https://corporate.bestbuy.com/2025/ways-to-get-your-tech/
