# Academy Sports + Outdoors research

Status: public research only; production automated collection disabled pending an authorized feed/provider or explicit rights.

## Useful public signals
- Product pages expose current price, regular/reference price, SKU/item identifiers, pickup/shipping/same-day availability states, and store-selection prompts.
- Academy states online and retail-store prices may differ and different sales channels may carry different prices.
- Price matching requires a verifiable advertised competitor price and identical-item availability; clearance/timed-event purchases are excluded from Academy purchase-price adjustments.
- The affiliate program provides links/creative and referral commissions, but should not be treated as authorization for broad price-history collection.

## HUNTIQ normalization rules
- Keep online, store-pickup, and same-day/delivery observations in separate channel histories.
- Never use credit-card signup pricing as the ordinary cash purchase price.
- Treat regular/reference price as context, not proof of historical selling price; HUNTIQ's anomaly baseline must come from repeated observations.
- Preserve SKU/item identifier, selected store, ZIP, fulfillment state, observed timestamp, and source provenance with every observation.
- Pricing-error language is a hypothesis only; Academy's terms expressly acknowledge that listed pricing/product-information errors can occur and orders may be refused/cancelled.

## Rights gate
Academy's February 20, 2026 Terms restrict harmful automated behavior such as robots/scripts and impose limits on site use. HUNTIQ therefore keeps direct automated Academy ingestion disabled. A future integration must use an authorized API/feed, a rights-cleared third-party provider, or another explicitly permitted source with retention/commercial-use rights reviewed before enabling production ingestion.
