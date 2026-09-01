# Best Buy API fit for HUNTIQ — 2026-09-01

Public research confirms Best Buy's developer platform exposes product catalog data including pricing, availability, specifications, descriptions, images, store metadata, and in-store product availability queries. Best Buy states most product information, including pricing, is updated near real-time. The Buying Options API also exposes Open Box inventory and reduced prices.

## Potential HUNTIQ value
- Legitimate catalog/price source for Best Buy products.
- Store-aware availability can support local opportunity presentation where the API returns it.
- Open Box data may be useful as a distinct opportunity type, but must remain separate from ordinary new-product markdown history.
- API rate limits published in the operational policy are 50,000 calls/day and 5 calls/second for Products, Reviews, Stores, Categories, Recommendations and Buying Options.

## Important legal/product constraints
Best Buy's API Terms require a developer account/key and impose important limits. Content may only be cached temporarily for up to 72 hours. The terms also prohibit using Best Buy API content on behalf of or for the benefit of third parties such as other retailers for analyzing Best Buy pricing/products/services. Branding requirements apply wherever the API has a presence. Commerce implementations must include Best Buy among the purchasing options, and Commerce Gateway use requires pre-approval.

## HUNTIQ policy
Do not treat Best Buy API data as a permanent historical-price warehouse unless Best Buy separately authorizes that retention. If integrated, retain source timestamps and expire API-derived content in compliance with the applicable terms. HUNTIQ-generated derived observations/history should be reviewed separately for contractual compliance before production use.

Production integration therefore requires a Best Buy developer account/API key and acceptance of the governing terms. No credentials should ever be committed to the public repository.
