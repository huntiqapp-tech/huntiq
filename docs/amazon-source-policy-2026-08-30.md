# Amazon source policy — 2026-08-30

Amazon's supported product-catalog path is now the Creators API; Amazon's documentation marks Product Advertising API 5.0 as deprecated in favor of Creators API. The current Creators API exposes product discovery plus OffersV2 price data, including featured offer price, savings basis, savings percentage and deal type. SearchItems can also filter by minimum/maximum offer price.

Access is not public or anonymous. Amazon says the account must be a finally accepted Amazon Associate, Creators API registration is limited to associates who have referred qualified sales, and application credentials are required. Initial documented quota is up to 1 request/second and 8,640 requests/day for the first 30 days, with later allocation tied to shipped revenue. Amazon's SDK guidance also says credentials must never be exposed client-side.

## HUNTIQ implementation policy

- Classify Amazon as `authorized connector / server-side only`.
- Build adapter contracts and fixtures without credentials now.
- Do not put Amazon credentials in the PWA/client bundle.
- Use OffersV2 only after Associates acceptance, Creators API approval and credentials exist.
- Treat featured-offer price, saving basis and deal type as distinct fields rather than collapsing them into one `regularPrice` value.
- Before storing permanent Amazon price history, review the Creators API license/retention rules for HUNTIQ's exact production use.

Sources checked 2026-08-30:
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-sdk
