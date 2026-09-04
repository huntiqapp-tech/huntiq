# Lowe's retailer-fit refresh — 2026-09-04

## Public-source findings

- Lowe's Price Promise does **not** match one Lowe's store against another Lowe's store, and Lowes.com does **not** match one ZIP code against another ZIP code.
- Price Promise is a conditional checkout rule for an identical in-stock item. It includes shipping/delivery cost when comparing the qualifying offer.
- Clearance, discontinued, used, refurbished, open-box, seasonal, closeout, damaged items, rebates, BOGO/Buy More Save More, selected-customer discounts, volume/wholesale discounts, marketplace sellers, pricing errors and several other promotional classes are excluded from Price Promise.
- Lowe's may limit price-match requests to reasonable quantities.
- Store Pickup requires the selected store and is only considered ready after Lowe's sends the ready-for-pickup notification.
- Same-day delivery is tied to the fulfilling store and delivery area; fulfillment fees belong in landed acquisition cost, not raw shelf-price history.

## HUNTIQ modeling implications

1. Keep Lowe's raw price history isolated by product + store/ZIP + channel. Never blend another Lowe's store or ZIP into the anomaly baseline merely because the SKU is identical.
2. Treat an approved Price Promise adjustment as conditional acquisition economics, not a rewrite of the observed shelf/web price.
3. Keep clearance and special promotions as explicit offer states; do not infer that they are price-matchable or nationally reproducible.
4. Treat pickup availability as evidence until a ready-for-pickup confirmation exists. Inventory remains non-guaranteed fulfillment evidence.
5. Add shipping/delivery fees to cash outlay where applicable before profit/ROI is calculated.
6. Quantity limits must constrain recommended buy quantity when the source exposes them.
7. Affiliate economics remain outside Flip Score/ranking.

## Sources

- https://www.lowes.com/l/about/price-promise
- https://www.lowes.com/l/about/store-services
- https://www.lowes.com/l/help/free-shipping

These rules are based on public retailer pages only and do not authorize scraping, redistribution, retention, or commercial API use. Provider/retailer rights remain a separate gate.