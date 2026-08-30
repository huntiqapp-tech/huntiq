# HUNTIQ public retailer research

Updated: 2026-08-30

## Home Depot — highest clearance priority
- HUNTIQ goal: store-level clearance history, markdown progression, Penny Watch and retailer verification.
- Home Depot currently states on its public site that local-store prices may vary from displayed prices and that inventory levels cannot be guaranteed. This reinforces HUNTIQ's storeId + observedAt + price + inventory observation model.
- Home Depot's current price-check guidance says users should select/change the local store on the product page to see the accurate local price and pickup/delivery availability. It also says online and in-store prices can intentionally differ because of local pricing strategies, promotions and inventory differences.
- Home Depot's price-match guidance explicitly excludes clearance/closeout items. That is useful product intelligence: HUNTIQ should not infer that an extreme local clearance price will be nationally reproducible or price-matchable at another store.
- Home Depot's public store surfaces expose store identity and store-selection context, while Home Depot's own app guidance says Store Mode can show what is in stock and where an item is located in the selected neighborhood store. This makes store identity and observation freshness core verification fields rather than optional metadata.
- Public product/store pages are suitable as manual/on-demand verification surfaces, but no general-purpose official consumer pricing API has been identified yet.
- Do not make the product dependent on unauthorized automated collection. Continue researching permissioned/licensed data, public interfaces suitable for manual/on-demand verification, affiliate/partner options and user-submitted observations.
- A Home Depot store observation should be treated as fresh evidence only for a limited window. Community leads decay faster and must not retain the same alert weight as a fresh retailer observation.

## Best Buy — strongest launch API route
- Best Buy's current developer portal confirms official Products, Stores and Buying Options APIs.
- The Products API exposes pricing, availability, specifications, descriptions and images across current/historical catalog items; Best Buy says most product information, including price, updates near real-time.
- The Stores API can be combined with Products queries for in-store product availability.
- Buying Options exposes open-box inventory, condition and reduced/special pricing, including multiple offers per SKU when available.
- This remains the strongest candidate for the first live retailer connector once an API key is authorized, and it is the cleanest source for validating HUNTIQ's price-history, anomaly, resale, economics and alert pipeline before harder clearance sources are connected.

## Walmart — catalog discovery is real; clearance access is not yet established
- Walmart's current Marketplace Item Search API can search the Walmart.com catalog by keyword, UPC, GTIN, EAN, ISBN and, in some modes, ASIN.
- Walmart's Marketplace APIs are explicitly partner/seller oriented. Promotions reports likewise require Marketplace access and report a seller's active/upcoming promotional pricing; they are not a public consumer clearance feed.
- HUNTIQ can use these routes for product identity/catalog normalization only if appropriate partner authorization exists; continue researching a consumer/affiliate-appropriate price route separately.

## Lowe's — do not scrape for resale intelligence
- Current Lowe's Terms of Use (effective July 15, 2026) prohibit robots/spiders/data-mining processes and specifically define extracting/scraping/gathering site information in connection with resale as prohibited reseller activity.
- HUNTIQ should use only an authorized/partner/licensed route for Lowe's retail data.

## Target — public research only; no systematic extraction
- Target's current Terms & Conditions were last updated April 15, 2026.
- The terms prohibit data extraction, scraping/mining and systematically downloading or storing site content including product listings, descriptions, prices and images, except within the limited license granted by the terms.
- HUNTIQ should not build a Target price-history collector by scraping Target.com. Keep Target restricted to public/manual research unless an approved or licensed data route is identified.

## Community signals
- Reddit and public deal communities may be used as discovery leads.
- Community posts are never treated as verified prices or inventory by themselves.
- Source type, verification state and observation age are persisted with every observation. Source confidence decays with age; evidence older than the configured maximum age expires from alert eligibility.
- Ingestion model: signal -> SKU/store normalization -> retailer verification -> source/freshness confidence -> history/anomaly scoring -> markdown cadence forecast/Penny Probability -> resale liquidity + momentum -> base/downside/risk-adjusted profit + ROI + safety margin -> capital-efficiency scoring -> alert eligibility/priority.
