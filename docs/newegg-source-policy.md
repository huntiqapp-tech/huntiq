# Newegg source policy

## Current official path

Newegg's public developer documentation describes Marketplace APIs and SDKs intended for registered Marketplace sellers. The SDK documentation says production API use requires a registered seller account plus API credentials requested through the Seller Portal. Simulation Mode is available without credentials.

Relevant documented capabilities include item management, seller management, reports, inventory, and price operations. Some item endpoints can identify products by Newegg item number, seller part number, or UPC and distinguish condition. Daily price and inventory reports are scoped to the authenticated seller's catalog/account.

## HUNTIQ policy

- Treat Newegg Marketplace APIs as an **authorized seller connector**, not a public retail-price feed.
- Do not interpret seller-specific price or inventory responses as a universal Newegg consumer price.
- Preserve product identifiers and condition (new/refurbished/used) when matching resale comps.
- Preserve observation timestamps locally so HUNTIQ's own price-history ledger, not the seller API, remains the source of historical anomaly evidence.
- Use Simulation Mode only for adapter development and fixtures; it is not evidence for a real opportunity.
- Keep credentials server-side if a production connector is added later.

## Access boundary

No credentials are required for public documentation research or Simulation Mode. Live Marketplace data requires seller registration and API credentials, so HUNTIQ should not request that authorization until a live Newegg connector is actually being enabled.
