# Staples — HUNTIQ public retailer modeling notes

Reviewed: 2026-09-05

## Current public-source observations

- Staples says prices in Staples retail stores and on Staples.com may vary. HUNTIQ should therefore keep store and online price histories separate unless a source explicitly proves the same channel/location price.
- Staples says store inventory varies by location and that availability is not guaranteed and is subject to change. A displayed pickup quantity is availability evidence, not secured inventory.
- Staples' Buy Online Pick Up In Store flow requires a subsequent "Ready for Pickup" email before the item can be collected. HUNTIQ should not upgrade displayed pickup availability to acquired/secured inventory merely because the product page offers pickup.
- Staples product pages can expose location-dependent pickup availability and even color/variant availability. Product identity and variant must remain exact before history or resale evidence is shared.
- Promotions, rewards, coupons, business-program pricing, and other entitlement-based pricing should be modeled as conditional acquisition economics rather than universal shelf-price history unless the public offer is broadly available with no account-specific requirement.

## HUNTIQ rules

1. Scope retail price history by Staples store/channel.
2. Keep pickup inventory as a timestamped availability observation until a ready/fulfilled state is independently established.
3. Do not let rewards or account-entitled discounts contaminate ordinary price-history baselines.
4. Preserve exact SKU/model/variant identity before combining Staples observations or applying resale comps.
5. Treat any matched or adjusted acquisition price as conditional economics, not proof that every Staples location offered that price historically.

## Public sources

- Staples Buy Online Pick Up In Store FAQ: https://www.staples.com/sbd/cre/products/140803/38050/faq.html
- Staples BOPIS overview: https://www.staples.com/sbd/cre/products/140803/38050/index.html
- Example Staples product page exposing store-dependent pickup/variant availability: https://www.staples.com/storex-storage-bins-classroom-caddy-assorted-stx00940u06c/product_2090979
