# Walmart retailer-fit notes — 2026-09-04

Public-policy research only. No account access or authenticated scraping used.

## Public facts relevant to HUNTIQ

### Store-local and online prices are distinct
Walmart's public FAQ says merchandise/prices on its website do not reflect merchandise/prices in stores, and store prices can vary by location because stores manage local inventory and may mark items down for overstock, local sales, or competition.

HUNTIQ implication: never use a national Walmart.com price as a store-local history observation. Store ID/location and channel must remain part of observation identity. Cross-store price differences are not automatically anomalies.

### In-store price match is conditional checkout economics
For U.S. store purchases, Walmart may match an identical item sold on Walmart.com when it is currently in stock and available, subject to restrictions and manager approval. Walmart excludes competitor prices, special-event/clearance/Rollback/Black Friday/Cyber Monday prices, Marketplace/third-party sellers, several offer types, and other Walmart-store prices. Quantity may be limited.

HUNTIQ implication: a potentially eligible Walmart.com match must not overwrite raw shelf-price history. It belongs in acquisition/checkout economics only after eligibility is verified. A predicted price match must remain uncertain until checkout/approval.

### Walmart.com does not price-match store or competitor prices
Walmart's public policy says Walmart.com does not match competitor prices, later Walmart.com price drops, Marketplace/third-party prices, or prices offered in Walmart stores.

HUNTIQ implication: do not manufacture an online acquisition price by importing a lower local-store or competitor price.

### Pickup substitutions change the actual acquisition item/price
Walmart's help page says out-of-stock pickup/delivery items may be substituted and the customer is charged the price of the substituted item. Customers can accept/decline substitutions, and order totals can change.

HUNTIQ implication: a substituted SKU is a new acquisition identity, not fulfillment of the original opportunity at the original economics. Alerts should not assume the original item remains obtainable after substitution.

### Walmart+ shipping/delivery benefits affect landed cost, not shelf history
Public Walmart+ terms describe free shipping on eligible Walmart-sold/shipped items and delivery-fee rules/minimums, with exclusions and possible express/oversize charges.

HUNTIQ implication: membership shipping savings belong in user-specific landed-cost economics. They must not become raw product price history or improve resale market value.

## HUNTIQ modeling rules for Walmart
1. Persist Walmart store-local price observations by store/location + channel + SKU/UPC identity.
2. Keep Walmart.com first-party, Walmart Marketplace third-party, pickup, delivery, and local store evidence distinguishable.
3. Treat eligible in-store Walmart.com price matching as conditional checkout economics only.
4. Never compare a local clearance shelf price against a national online baseline without clearly labeling the channel/location difference.
5. Treat substitutions as a product-identity change requiring a fresh opportunity evaluation.
6. Keep Walmart+ shipping/delivery savings separate from shelf price and from resale value.
7. MSRP/list/strike-through prices remain display context only and never drive BUY/WATCH/SKIP economics.

## Public sources checked
- https://corporate.walmart.com/policies
- https://corporate.walmart.com/askwalmart/does-walmart-price-match
- https://corporate.walmart.com/askwalmart
- https://www.walmart.com/help/article/substitutions-for-store-pickup-and-delivery-items/c8dd3973509b42488da66a362af4666d
- https://www.walmart.com/help/article/walmart-benefits-free-shipping-and-free-delivery-from-your-store/d1738a201207485c99fd53ccdbc49699
