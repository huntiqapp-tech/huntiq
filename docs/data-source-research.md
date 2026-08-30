# HUNTIQ public retailer research

Updated: 2026-08-30

## Home Depot — highest clearance priority
- HUNTIQ goal: store-level clearance history, markdown progression, Penny Watch and retailer verification.
- Home Depot publicly notes that local-store pricing can vary and displayed availability is not guaranteed, so store identity and observation timestamps must be first-class fields in HUNTIQ.
- No general-purpose official consumer pricing API has been identified yet.
- Do not make the product dependent on unauthorized automated collection. Continue researching permissioned/licensed data, public interfaces suitable for manual/on-demand verification, and retailer partnership options.

## Best Buy — strongest launch API route
- Official developer APIs expose products, pricing, availability, stores and in-store availability.
- Buying Options API exposes open-box inventory and reduced prices.
- Candidate for the first real retailer connector once an API key is available.

## Walmart — catalog route identified, retail-deal fit still under validation
- Current developer platform exposes item search/catalog capabilities and active Marketplace APIs.
- Marketplace inventory/pricing APIs are seller/partner oriented; do not assume they provide arbitrary consumer store-level clearance data.
- Continue researching an affiliate/consumer-appropriate route before implementation.

## Lowe's — do not scrape for resale intelligence
- Current Lowe's Terms of Use (effective July 15, 2026) prohibit robots/spiders/data-mining processes and specifically define extracting/scraping/gathering site information in connection with resale as prohibited reseller activity.
- HUNTIQ should use only an authorized/partner/licensed route for Lowe's retail data.

## Community signals
- Reddit and public deal communities may be used as discovery leads.
- Community posts are never treated as verified prices or inventory by themselves.
- Ingestion model: signal -> SKU/store normalization -> retailer verification -> history/anomaly scoring -> resale comparison -> profit/ROI -> alert eligibility.
