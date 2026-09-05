# Costco public retailer research — 2026-09-05

## HUNTIQ modeling rules

- Warehouse inventory and prices are location-specific. Costco says inventory/pricing can be delayed by up to 30 minutes, can change quickly, and out-of-stock items may disappear from results. Treat warehouse availability as observed evidence, not secured inventory.
- Costco warehouse prices can differ by warehouse. Preserve warehouse identity on every price-history observation; do not create a single national Costco baseline.
- Costco.com and warehouse prices are separate channels. Online pricing can differ because of shipping costs and warehouse-only promotions.
- Costco Same-Day / Instacart pricing is a separate acquisition channel. Same-Day item prices are marked up above local warehouse pricing and can include additional service economics.
- Same-Day substitutions or added items can change the final charge. Displayed cart economics are not secured acquisition cost until fulfillment.
- Costco does not generally match Costco.com purchases to warehouse prices. Any post-purchase adjustment must be modeled as conditional acquisition economics, not raw shelf-price history.

## Public sources reviewed

- Costco Customer Service, “How do I check warehouse inventory and prices?” published 2026-01-06.
- Costco Customer Service, “How can I see if an item sold on Costco.com is also available at my local Costco?” published 2026-03-11.
- Costco Customer Service, “Are warehouse and online prices the same?” published 2026-05-28.
- Costco Customer Service, “Why do prices vary between Costco Warehouse locations?”
- Costco Same-Day pricing policy and Same-Day Delivery FAQs.
- Costco.com price-match guidance.

## Product implications

For anomaly scoring, compare Costco warehouse observations only against the same warehouse/location/channel unless a deliberate cross-location comparison is being shown as secondary evidence. For resale economics, keep Same-Day markup and service costs inside acquisition cost rather than contaminating warehouse price history. For alerts, stale or unconfirmed availability should lower fulfillment confidence and must never be described as guaranteed stock.
