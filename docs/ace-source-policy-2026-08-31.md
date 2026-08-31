# Ace Hardware public-source semantics — 2026-08-31

## Official public findings

Ace Hardware's current Customer Service / Online Services language says product availability and pricing vary by location, based on a supplied location/IP/marketing context, and that online pricing may differ from prices at Ace Hardware stores. Ace also says local-store fulfillment is only confirmed after order processing; pickup/delivery participation, stock and timing vary by store.

Official source reviewed: https://www.acehardware.com/customer-service

## HUNTIQ engineering rules

1. Treat Ace observations as `product + selected store/location + timestamp + price_scope`; never promote one observed price to a chain-wide price.
2. Preserve `online` and `in_store` as different price scopes because Ace explicitly allows them to differ.
3. Treat a product-page pickup/in-stock indication as a retailer-page inventory observation, not guaranteed shelf quantity.
4. Do not assign 100% fulfillment confidence before store confirmation. Age public page inventory aggressively because local stock can change before pickup confirmation.
5. Receipt/store-scan evidence may corroborate an in-store price, but it must remain store-scoped and time-scoped.
6. HUNTIQ alerts should display an inventory-confidence/freshness penalty when availability is based only on an older public page observation.

## Implementation impact

This retailer is a direct use case for the temporal inventory-confidence model introduced in v0.9.7: retailer-page stock gets a shorter half-life than receipt evidence, and stale availability reduces expected profit/ROI and alert priority instead of remaining permanently trusted.
