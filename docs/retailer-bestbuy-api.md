# Best Buy public API fit for HUNTIQ

Checked: 2026-08-31

## Useful capabilities

Best Buy's official developer portal currently exposes Products, Categories, Stores, Recommendations, and Buying Options APIs. The Products API includes pricing, availability, specifications, descriptions, and images; Best Buy says most product information, including pricing, is updated near real time. Store queries can be combined with product queries for in-store availability. Buying Options exposes open-box inventory and condition/reduced-price data.

Operational policy currently lists 50,000 calls/day and 5 calls/second for Products, Reviews, Stores, Categories, Recommendations, and Buying Options.

## HUNTIQ restrictions / design decision

Best Buy's API Terms currently state that API Content may only be cached temporarily for up to 72 hours. They also restrict using the service/content on behalf of or for the benefit of a third party for analyzing Best Buy pricing, products, or services, and require a valid developer key/account plus branding requirements.

Therefore HUNTIQ must **not** use the Best Buy API as the source of its long-term price-history database unless Best Buy grants separate written rights. Treat official Best Buy API observations as `internal-display-temporary` with a hard 72-hour retention policy. Do not mark them resale/data-licensing eligible.

The official API may still be useful for current product identity, current availability, current display pricing, and open-box context once an authorized account/key is available, subject to the Terms. Historical Best Buy analytics should come only from a source whose license explicitly permits that retention/use, or from rights-cleared first-party/community observations.

Sources:
- https://developer.bestbuy.com/apis
- https://developer.bestbuy.com/legal
