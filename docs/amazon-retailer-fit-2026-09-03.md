# Amazon retailer fit — 2026-09-03

## HUNTIQ modeling decisions

- Amazon prices are dynamic. Treat each observed Featured Offer/current offer as timestamped evidence, not a permanent reference price.
- Amazon's 2026 reference-pricing changes make its own Price history graph useful corroboration evidence: Amazon says the graph shows the lowest Featured Offer price each day. Typical Price is based on the median non-promotional price customers paid over the prior 90 days, with updated handling when more than half of the 90-day history falls below that median.
- Business-only prices, quantity discounts and Subscribe & Save discounts are conditional acquisition economics. They must not overwrite anonymous raw public price history.
- Quantity limits are real constraints. Amazon Business terms prohibit circumventing product quantity limits by creating multiple Business Accounts.
- For Amazon resale economics, HUNTIQ must distinguish retail acquisition from Amazon Marketplace resale costs and seller eligibility. A retail price anomaly is not proof that an Amazon resale listing is permitted or profitable.
- Effective March 31, 2026, Amazon ended commingling for newly shipped inventory and requires resellers who are not Brand Representatives to use Amazon barcode stickers even when products have manufacturer barcodes. Treat FBA labeling/prep as a potentially material fulfillment cost when Amazon is the resale channel.

## Architecture consequence

Amazon reference-price or history evidence can corroborate an anomaly, but HUNTIQ should preserve the exact offer/channel/time identity and keep account-dependent discounts separate. Crosschecked observations should pass the retailer-crosscheck validation gate before being promoted into permanent anomaly history or urgent alerts.

## Public sources reviewed

- Amazon Seller Central News: Upcoming Improvements to Reference Pricing (effective April 23 / May 18, 2026).
- Amazon Business Pricing Policy.
- Amazon Business Feature Terms and Conditions — quantity limits.
- Amazon Seller Central News: commingling practices ended effective March 31, 2026.
