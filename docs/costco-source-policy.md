# Costco source policy

## Publicly documented behavior

Costco documents that Costco.com inventory is live and updated frequently, while local warehouse inventory/pricing can differ by location. Costco's January 6, 2026 warehouse inventory guidance says warehouse inventory and pricing returned through its customer-facing tools may be delayed by up to 30 minutes, can change quickly, and omit out-of-stock items. Costco also states that Same-Day Delivery prices are marked up above local warehouse prices.

## HUNTIQ policy

- Treat `costco.com`, warehouse, and Same-Day Delivery as distinct price channels.
- Never compare a Same-Day Delivery marked-up price directly against a warehouse observation as if both were the same retail baseline.
- Preserve warehouse/store identity for local observations and timestamp every observation locally.
- Apply a freshness penalty to warehouse availability/pricing older than 30 minutes when the observation comes from a source with the documented delay.
- Treat missing warehouse items as unknown/out-of-stock evidence, not as a zero price.
- Keep Costco.com inventory history separate from warehouse price history because online assortment can differ from local warehouses.
- No automated account login, membership scraping, or customer-session automation is required for the current public-source research phase.

## Future authorized access boundary

Customer-specific warehouse lookup flows may require Costco account authentication or membership context. HUNTIQ should only request that authorization when a user explicitly enables a live Costco connector that needs it.
