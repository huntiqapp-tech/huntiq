# Lowe's retailer fit — 2026-09-05

Public-source research only. No account access, credentials, checkout automation, or private data used.

## HUNTIQ modeling rules

- **Keep Lowes.com and store-local prices separate.** Lowe's terms state that the online price may differ from in-store pricing and excludes store-specific sales, discounts, rebates, and markdowns. Store/ZIP/channel therefore remain part of the price-history identity.
- **Do not treat another Lowe's store or ZIP as a guaranteed match.** Lowe's Price Promise says stores do not match prices from another Lowe's store and Lowes.com does not match across ZIP codes.
- **Treat Price Promise as conditional acquisition economics.** A match requires an identical qualifying item and validation; exclusions include clearance, discontinued, used, refurbished, open-box, damaged, seasonal/closeout items, bundles, one-time promotions, loyalty/military pricing, wholesale/volume pricing, membership wholesalers, marketplace sellers, auction sites, and pricing errors. Shipping/delivery cost is included when comparing eligible offers.
- **Treat pickup availability as fulfillment evidence, not secured inventory.** Lowe's tells customers to wait for the ready-for-pickup email. Same-day pickup depends on store availability and is not available for every item/category.
- **Keep delivery economics separate from shelf history.** Same-day delivery availability depends on the fulfilling store and delivery fees/eligibility; special-order products can have future availability and materially different fulfillment timing.

## Public sources

- Lowe's Price Promise, retrieved 2026-09-05: https://www.lowes.com/l/about/price-promise
- Lowe's Terms & Conditions of Use, retrieved 2026-09-05: https://www.lowes.com/l/about/terms-and-conditions-of-use
- Lowe's Store Services, retrieved 2026-09-05: https://www.lowes.com/l/about/store-services
- Lowe's Shipping & Delivery, retrieved 2026-09-05: https://www.lowes.com/l/help/shipping-delivery

## Product implication

Lowe's reinforces HUNTIQ's store/channel evidence model. A displayed discount, another ZIP's price, a Price Promise candidate, or a pickup badge is not equivalent to a secured acquisition. Price-history anomalies should remain store/channel scoped, and customer profit/ROI or urgent alerts should only use acquisition conditions and resale evidence that survive the live evidence boundary.
