# Lowe's public retailer research — 2026-09-05

Scope: public U.S. Lowe's pages only. No account access used.

## Price and location identity

- Lowe's states that prices, promotions, styles, and availability may vary and that local stores do not honor online pricing.
- Lowe's Price Promise FAQ says stores do not match prices from another Lowe's location and Lowes.com does not match prices across ZIP codes.
- Product Q&A published in 2026 also explains that store pricing can differ because of regional costs, market conditions, transportation, and inventory availability.

### HUNTIQ rule
Keep Lowe's price-history observations scoped by store/ZIP and channel. Do not merge store, ZIP, and online observations into one national baseline.

## Price matching

Lowe's Price Promise applies to a current lower price on an identical in-stock item from a qualifying local or online retailer and requires validation. The policy excludes, among other things, clearance, discontinued, used, refurbished, open-box, damaged, bundle/BOGO, rebates, select-group discounts, membership wholesalers, third-party marketplace sellers, auction sites, pricing errors, and competitor wholesale/volume pricing.

### HUNTIQ rule
Treat a possible price match as conditional acquisition economics only after exact-item and eligibility checks. Do not backfill a matched competitor price into Lowe's raw historical shelf-price observations.

## Pickup and inventory

Lowe's says Store Pickup customers are notified by email once a purchase is ready for pickup. The general site also states availability can change without notice.

### HUNTIQ rule
Displayed pickup/stock status is availability evidence, not secured inventory. Upgrade fulfillment confidence only after an order-ready confirmation or stronger direct fulfillment evidence.

## Profit and ROI treatment

- Use the actually obtainable acquisition cost for the exact store/ZIP/channel.
- Exclude hypothetical price matches from realized economics until eligibility is verified.
- Do not use MSRP, strike-through, or retailer anchor pricing as resale value.
- Base resale value on verified completed-sale evidence and expected net proceeds after marketplace fees, shipping, returns/risk allowances, and other modeled costs.

## Public sources

- https://www.lowes.com/ — pricing/availability variability notice.
- https://www.lowes.com/l/about/price-promise — Price Promise rules, exclusions, store/ZIP FAQ.
- https://www.lowes.com/l/about/store-services — Store Pickup ready-email workflow.
