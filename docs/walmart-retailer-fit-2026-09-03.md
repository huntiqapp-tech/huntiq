# Walmart retailer-fit notes — 2026-09-03

Public-source research only. No Walmart account access was used.

## Channel and location identity
- Walmart states that prices can vary from store to store because stores manage inventory locally and may mark items down for overstock, local sales, or competition.
- Walmart Pickup and Delivery pricing follows the prices of the store that picks/packs the order; switching stores can change order totals.
- HUNTIQ implication: store, pickup/delivery store, and Walmart.com observations must not be collapsed into one national price-history baseline.

## Price matching and anomaly interpretation
- A U.S. store may match an identical in-stock Walmart.com item, but exclusions include clearance, Rollback, Black Friday/Cyber Monday and other limited-time promotions.
- Walmart does not price-match one Walmart store against another, and Walmart.com does not price-match store prices or later price decreases.
- Walmart's current Terms say pricing or availability errors can occur and orders containing those errors may be canceled even after an order confirmation or shipping notice.
- HUNTIQ implication: price matches belong in checkout/acquisition economics, while suspected price errors remain unconfirmed anomalies and must never be presented as guaranteed fulfillment.

## Inventory and fulfillment confidence
- Walmart's substitution policy confirms that an item accepted into a pickup/delivery order can still be unavailable during fulfillment and replaced or removed.
- A substitution can change both product identity and the charged price.
- HUNTIQ implication: pickup/orderable status cannot be used as a hard on-hand count, and a substituted item must create new product/price evidence rather than inheriting the original SKU's anomaly or resale score.

## Quantity and reseller risk
- Walmart.com reserves the right to limit quantities per person, household, order, account, payment method, billing address or shipping address.
- Its help material says the website is intended for personal, non-commercial use and Walmart reserves the right to prohibit dealers or resellers.
- HUNTIQ implication: online multi-unit recommendations need a retailer-specific quantity/reseller-risk warning and must not assume every visible unit is purchasable.

## Sources
- Walmart Policies and Guidelines: https://corporate.walmart.com/policies
- Walmart Price Match Policy: https://www.walmart.com/help/article/walmart-price-match-policy/6295d9e1a501489b9aa40a60c899b288
- Walmart Substitutions for Store Pickup and Delivery Items: https://www.walmart.com/help/article/substitutions-for-store-pickup-and-delivery-items/c8dd3973509b42488da66a362af4666d
- Walmart Quantity Limits and Bulk Purchases: https://www.walmart.com/help/article/bulk-purchases-and-dealer-sales/825450266d4245b29e242d06a01bd91d
- Walmart.com Terms of Use: https://www.walmart.com/help/article/walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0
