# Macy's retailer-fit research — 2026-09-04

## Public-source findings

- Macy's states that stores and macys.com operate separately, so prices, products and promotions may differ between online and store channels.
- Macy's defines Regular/Original price as a price at which an item was offered, not necessarily a price at which it sold. HUNTIQ must therefore keep this as reference context only and never use it as resale value.
- Clearance/Closeout/Now/Just Reduced are permanent reductions, while Limited Stock / While Supplies Last indicates scarcity rather than guaranteed inventory.
- Store pickup is tied to the selected store. The order is not ready until Macy's sends the Ready for Pickup notice; pickup location cannot be changed after checkout.
- Shipping thresholds and same-day delivery fees vary with membership/order value and belong in landed acquisition cost rather than raw product price history.
- Star Money is deferred loyalty value. It is issued after qualifying points accumulate, has redemption restrictions and cannot be exchanged for cash, so it must not be treated as an immediate shelf-price reduction unless actually redeemed at checkout.
- Macy's Clearance Store is a separate in-store-only channel with location-varying inventory, no online shopping, no coupons, and final-sale purchases. It must not be blended with mainline store or macys.com history.

## HUNTIQ modeling implications

1. Isolate raw history by product + Macy's channel + store/location where applicable.
2. Treat Regular/Original/compare-at style prices as non-authoritative reference values only; they cannot influence resale value, profit, ROI, ranking or alerts.
3. Model coupons, promo codes and approved store-price honoring only as conditional acquisition economics.
4. Treat Star Money as deferred retailer value unless it is actually redeemed in the transaction.
5. Treat pickup availability as evidence until the Ready for Pickup notice exists; do not claim possession from product-page availability.
6. Keep Macy's Clearance Store as a distinct channel because its inventory, coupon rules, final-sale status and store-only nature materially change economics.
7. Include delivery/shipping fees in cash outlay before profit and ROI calculations.
8. Affiliate payout remains outside HUNTIQ opportunity ranking.

## Public sources checked 2026-09-04

- https://www.macys.com/customer-service/articles/what-are-macys-policies-for-online-merchandise-pricing-and-price-adjustments
- https://www.macys.com/customer-service/articles/store-pick-up-information
- https://www.macys.com/s/free-shipping/
- https://www.macys.com/customer-service/articles/macys-clearance-store
- https://www.macys.com/s/promotional-details/starmoneyrewards-on-34th/

These public rules do not grant scraping, retention, redistribution or commercial-use rights. Provider and retailer rights remain separate gates before live customer use.
