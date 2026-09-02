# Staples retailer fit — 2026-09-02

Public-policy research only. No account access, login, credential use, or undocumented endpoint assumptions.

## HUNTIQ modeling rules

- Treat Staples store price and Staples.com price as distinct channel observations. Staples states that store and online prices may vary.
- A price match is a conditional acquisition event, not raw shelf-price history. Eligible items must be identical, new, in stock and verifiable; Staples reserves the right to verify and decline a match.
- Store pickup availability is evidence of current local availability, but not guaranteed fulfillment. Keep `available` separate from `confirmed/ready-for-pickup`.
- Easy Rewards points are account-linked value. Members earn points on qualifying purchases and redeem points at checkout; redemption online requires account login, while store redemption includes member identification requirements.
- Do not apply Easy Rewards value to anonymous/public deal economics unless the shopper is eligible and the points are actually available for redemption. Points earned from a purchase are not treated as a reduction to the raw observed product price.
- Personalized/activated bonus-point offers belong in qualification-aware promotion economics, not the retailer price-history baseline.
- Shipping/delivery thresholds and courier fees belong in fulfillment/channel economics, not product-price anomaly history.

## Public sources reviewed

- Staples Easy Rewards overview: https://www.staples.com/lp/easyrewardsoverview
- Staples Price Match Guarantee Policies: https://www.staples.com/hc?id=264ff910-90e6-4f8f-806c-14d8e7d5d7d9
- Staples buy-online/pick-up FAQ: https://www.staples.com/sbd/cre/products/140803/38050/faq.html
- Staples Print courier/delivery page: https://www.staples.com/services/printing/in-store-printing/courier-services/

## Integration implication

HUNTIQ can ingest public Staples price/availability observations when legally and technically available, but should keep raw price evidence immutable and model rewards, price matches, delivery thresholds and other checkout-specific conditions separately. No unrestricted official public local-price/inventory API was established in this research pass.