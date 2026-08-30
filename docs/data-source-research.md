# HUNTIQ public retailer research

Updated: 2026-08-30

## Home Depot — highest clearance priority
- HUNTIQ goal: store-level clearance history, markdown progression, Penny Watch and retailer verification.
- Home Depot currently states on its public site that local-store prices may vary from displayed prices and that inventory levels cannot be guaranteed. This reinforces HUNTIQ's storeId + observedAt + price + inventory observation model.
- Home Depot's public price-check guidance says selecting the local store is how users obtain the most accurate local price and stock context, and it explicitly notes that online and in-store prices can differ. That makes store selection a required verification dimension for Penny Watch rather than optional metadata.
- Public product/store pages are suitable as manual/on-demand verification surfaces, but no general-purpose official consumer pricing API has been identified yet.
- Do not make the product dependent on unauthorized automated collection. Continue researching permissioned/licensed data, public interfaces suitable for manual/on-demand verification, affiliate/partner options and user-submitted observations.

## Best Buy — strongest launch API route
- Official developer APIs expose product catalog data, pricing, availability, stores and in-store availability; Best Buy says most product information, including price, is updated near real-time.
- Buying Options API exposes open-box inventory, condition and reduced prices.
- This remains the strongest candidate for the first live retailer connector once an API key is authorized.

## Walmart — catalog discovery is real; clearance access is not yet established
- Walmart's current Marketplace Item Search API can search the Walmart.com catalog by keyword, UPC, GTIN, EAN, ISBN and, in some modes, ASIN.
- Walmart's Marketplace APIs are explicitly partner/seller oriented. Promotions reports likewise require Marketplace access and report a seller's active/upcoming promotional pricing; they are not a public consumer clearance feed.
- HUNTIQ can use these routes for product identity/catalog normalization only if appropriate partner authorization exists; continue researching a consumer/affiliate-appropriate price route separately.

## Lowe's — do not scrape for resale intelligence
- Current Lowe's Terms of Use (effective July 15, 2026) prohibit robots/spiders/data-mining processes and specifically define extracting/scraping/gathering site information in connection with resale as prohibited reseller activity.
- HUNTIQ should use only an authorized/partner/licensed route for Lowe's retail data.

## Community signals
- Reddit and public deal communities may be used as discovery leads.
- Community posts are never treated as verified prices or inventory by themselves.
- Ingestion model: signal -> SKU/store normalization -> retailer verification -> history/anomaly scoring -> markdown velocity/Penny Probability -> resale comparison -> downside/base profit + ROI -> alert eligibility/priority.
