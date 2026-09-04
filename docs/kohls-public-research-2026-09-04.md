# Kohl's public retailer research — 2026-09-04

## Public findings

- Kohl's states that pricing, promotions, and merchandise availability may vary by location and at Kohls.com. Its Regular/Original price can be a former or future offered price for the item or a comparable item, and actual sales may not have occurred at that reference price.
- Kohl's stores may match Kohls.com pricing even though Kohls.com pricing can differ from store pricing. Price matching has conditions and exclusions; coupons cannot be stacked onto a price-matched item, while Kohl's Cash and Rewards can still be earned or redeemed.
- Price adjustments generally require the item's sale/regular price to have dropped within the prior two weeks and exclude clearance markdowns and BOGO-related items.
- Free Store Pickup is location-specific. Kohl's says qualifying orders are normally processed within two hours when ordered early enough before closing, but the customer should wait for the Ready for Pickup email/text. The selected pickup location cannot be changed after order placement.
- Store-pickup merchandise can become unavailable; therefore displayed pickup availability is evidence of potential fulfillment, not proof that inventory has been secured.

## HUNTIQ modeling rules

1. Keep Kohl's raw price history scoped to store/location and channel. Do not blend store and Kohls.com observations into a national baseline.
2. Treat Regular/Original prices as reference-price metadata only. Never use them as resale value or as proof of a historical transaction price.
3. Store a successful price match or price adjustment as conditional acquisition economics, not as an ordinary shelf-price observation.
4. Keep clearance and BOGO/promotion observations in condition/promotion-specific history so they do not contaminate normal-item anomaly baselines.
5. Store pickup availability as timestamped fulfillment evidence. Do not mark inventory secured until a Ready for Pickup confirmation is observed through an authorized source or supplied by the user.
6. Rewards/Kohl's Cash are deferred or account-context value and must not reduce raw shelf price unless actually redeemed in the modeled transaction.

## Public sources reviewed

- Kohl's Price Match Policy: https://www.kohls.com/faq/article/90
- Kohl's Online Order Pickup: https://www.kohls.com/faq/article/1169
- Kohl's Price Adjustments: https://www.kohls.com/faq/article/88
- Kohl's Pricing Policy & Product Information: https://www.kohls.com/faq/article/85
