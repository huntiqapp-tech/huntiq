# Costco retailer research

Reviewed: 2026-09-01

## Public behavior relevant to HUNTIQ

- Costco.com can expose warehouse-specific inventory when the shopper selects a preferred warehouse and the feature is active for that item.
- Costco Same-Day prices are higher than local warehouse prices because delivery/service costs are added, so Same-Day price must never be treated as the local warehouse shelf price.
- Costco states that warehouse price and item availability are transmitted to Instacart for Same-Day fulfillment, confirming that location-specific price/inventory data exists even though the consumer Same-Day surface adds delivery markup.

## HUNTIQ modeling decision

- Keep Costco observations scoped by retailer + product + warehouse/ZIP.
- Treat `costco.com warehouse`, `warehouse shelf`, and `same-day delivery` as distinct channels; do not merge their price baselines.
- Same-Day observations may be useful for availability context but should not become the anomaly baseline for warehouse clearance pricing because the price includes delivery/service markup.
- Direct automated ingestion from the Costco/Instacart Same-Day service remains disabled: current Instacart terms explicitly prohibit scraping the service through automated means unless separately permitted.
- No public general-purpose Costco pricing/inventory API was identified in this research pass. Production ingestion should use an authorized feed, rights-cleared provider, or permitted community observations.

## Sources

- Costco local warehouse availability help: https://customerservice.costco.com/app/answers/answer_view/a_id/11031/loc/en_US
- Costco Same-Day pricing: https://www.costco.com/f/-/same-day
- Costco Same-Day / Instacart terms: https://sameday.costco.com/terms

## Status

Candidate retailer: useful and strongly location-aware, with strict channel separation required. Automated direct collection is disabled pending authorized access or a rights-cleared provider.