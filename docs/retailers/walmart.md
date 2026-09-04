# Walmart public retailer research

Reviewed: 2026-09-03

## HUNTIQ modeling rules

- Preserve store identity on every observation. Walmart publicly says prices can vary by store because stores manage their own inventory and may reduce prices for overstock, local sales, or local competition.
- Keep Walmart.com and physical-store histories separate. Walmart says website merchandise/prices do not necessarily reflect store merchandise/prices.
- Treat store price matching as transaction-specific acquisition economics, not baseline history. U.S. stores may match an identical, currently in-stock Walmart.com item, subject to restrictions and manager approval; competitor prices, Marketplace sellers, clearance, Rollback, Black Friday/Cyber Monday and other limited-time promotions are excluded.
- Preserve quantity-limit uncertainty. Walmart reserves the right to limit some price matches to one item per customer per day, and high-demand items can carry purchase limits.
- Treat pickup/delivery availability as local evidence, not guaranteed possession. Pickup/delivery depends on the selected nearby store, and out-of-stock items may be substituted.
- Keep substitutions out of the original SKU economics. Walmart says customers are charged the price of the substituted item received, so a substitution creates a different acquisition observation rather than validating the original item price.
- For Walmart Pickup and Delivery, associate the price with the store that picks/packs the order. Walmart says those prices are the same as that packing store's prices and may differ from other stores.

## Public sources

- Walmart Corporate Policies and Guidelines: U.S. price match policy
- Ask Walmart FAQ: store-to-store and store-vs-online price differences
- Walmart.com Help: The Walmart Site and App Experience
- Walmart.com Help: Substitutions for Store Pickup and Delivery Items
- Walmart.com Terms of Use: Walmart Pickup and Delivery Pricing
- Walmart.com Help: Event Support / quantity limits

No account access, authentication, scraping bypass, or private retailer data is required for these policy rules.