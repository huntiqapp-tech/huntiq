# Tractor Supply public-data fit for HUNTIQ

Checked: 2026-08-31

## Public signals that fit HUNTIQ

Tractor Supply's public site is explicitly location-aware: it asks for a U.S. ZIP code to show localized pricing, purchasing options, pickup availability, and delivery services. Its store selector notes that changing the selected store can change localized pricing. Product support answers also direct shoppers to select a preferred store to see store-specific stock status.

This makes Tractor Supply a strong candidate retailer for HUNTIQ's location-keyed price-history model because the data shape matches the existing `retailer | product | store/ZIP` identity.

## Collection policy

Do not build a production automated collector from TractorSupply.com until HUNTIQ has reviewed and documented the retailer's current automation/data-extraction terms or obtained an authorized provider/API path. For now, treat the public site as a research/manual-verification source and retain the ingestion architecture as provider-neutral.

## HUNTIQ mapping

- ZIP/store selection -> `zip` / `storeId`
- localized item price -> `price`
- pickup stock status -> `availability`
- observation timestamp -> `observedAt`
- provider/rights metadata -> required before persistence into production history

Sources:
- https://www.tractorsupply.com/tsc/store-locator
- https://www.tractorsupply.com/tsc/
