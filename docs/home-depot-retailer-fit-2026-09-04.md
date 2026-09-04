# Home Depot retailer fit — 2026-09-04

## Decision

Home Depot remains a priority HUNTIQ retailer, but observations must preserve store/location and channel identity. Public Home Depot pages currently state that local store prices may vary from displayed prices and that inventory availability cannot be guaranteed, so a nationalized price history would be misleading.

## Public-source findings

1. Home Depot's current public Price Match / Price Inquiry page states that local store prices may vary from displayed prices and that products shown as available are normally stocked but inventory levels cannot be guaranteed.
   Source: https://www.homedepot.com/c/price-match-and-price-check

2. Home Depot's public store information pages repeat the same local-price and inventory warning. HUNTIQ should therefore keep store/ZIP/channel identity attached to every Home Depot observation and treat availability as a timestamped observation rather than a guarantee.
   Source: https://www.homedepot.com/c/About_Our_Stores

3. Current product/category pages can expose fulfillment and quantity constraints, including ZIP-dependent delivery/availability and order limits. Those belong to fulfillment/capacity evidence and must not be interpreted as universal inventory.
   Example public page: https://www.homedepot.com/b/Building-Materials-Siding/Arctic-White/White/N-5yc1vZaripZ1z13hmnZ1z17oyo

4. Home Depot's current Terms of Use page also repeats the local-store-price variation and inventory-not-guaranteed language. Any automated public-page observation remains validation-only unless retention/display rights are separately established.
   Source: https://www.homedepot.com/c/Terms_of_Use

## HUNTIQ modeling rules

- Identity key: retailer + product/SKU + store or ZIP + channel + observed timestamp.
- Store-local and online observations must never be merged into one authoritative price-history row without an explicit matching rule.
- Availability is evidence with freshness, not a promise of stock.
- Quantity/order limits constrain buy-quantity recommendations and expected profit capacity.
- Price-match or checkout adjustments belong in acquisition economics, not raw historical shelf price.
- Public-page observations remain validation-only until retention and customer-display rights are explicitly validated.
- Retailer reference/MSRP/list values remain context only and cannot drive resale value, profit, ROI, anomaly authority, or alerts.
