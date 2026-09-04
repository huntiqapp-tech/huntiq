# Best Buy public retailer rules — 2026-09-04

## HUNTIQ modeling rules

- Treat direct Best Buy new-product offers separately from Best Buy Marketplace seller offers.
- Price Match is conditional acquisition economics, not raw universal shelf-price history.
- Do not use clearance, refurbished, pre-owned, open-box, Marketplace, limited-quantity, bundle, coupon, financing, gift-card, loyalty-only, or pricing-error offers as evidence that a normal new-item baseline changed.
- Store Pickup is fulfillment evidence only after Best Buy reports the order ready; advertised pickup speed is not guaranteed inventory ownership.
- Open-box and outlet inventory should retain condition and location identity and must never contaminate new-item price history or completed-sale product identity.

## Public-source findings

Best Buy's Price Match Guarantee, effective January 16, 2026, covers immediately available identical new products sold by Best Buy and excludes Marketplace Products, clearance, refurbished and open-box items. It also excludes many conditional promotions including bundles, coupons, financing, gift-card offers, limited quantity, pricing errors and select-member pricing.

Best Buy's public fulfillment guidance says Store Pickup is available at every location and most orders are ready within an hour, but the customer should wait for the ready notification before pickup. HUNTIQ therefore treats pickup status as location/time fulfillment evidence rather than secured inventory.

Best Buy Outlet guidance states its Price Match Guarantee does not apply to clearance and open-box products and warranty coverage can vary by product. Those observations remain condition-specific and are isolated from standard new-item baselines.

Sources reviewed 2026-09-04:
- https://www.bestbuy.com/site/help-topics/price-match-guarantee/pcmcat290300050002.c
- https://corporate.bestbuy.com/2025/ways-to-get-your-tech/
- https://www.bestbuy.com/site/outlet-refurbished-clearance/outlet-stores-faqs/pcmcat748301999410.c
