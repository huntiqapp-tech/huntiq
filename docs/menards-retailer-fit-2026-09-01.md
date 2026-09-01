# Menards retailer fit — 2026-09-01

## Public findings
- Menards operates an official API Developer Portal at `developer.apim.menards.com`.
- The portal labels production access as **Prior Authorization Required**. HUNTIQ must not assume public production entitlement or reverse-engineer private endpoints.
- Public Menards product pages expose a SKU/model, everyday price, pickup/store context, and rebate information. Rebate value is not equivalent to an instant checkout price: Menards states that the 11% rebate is issued later as a Rebate Credit Check for future in-store merchandise purchases.

## HUNTIQ implications
1. Treat `checkout_price`, `rebate_value`, and `effective_after_rebate_value` as separate fields. Never score the after-rebate value as if it were cash paid today.
2. Menards store context belongs in `location_key`; do not blend store-local prices.
3. An authorized Menards API could become a preferred source, but production integration is blocked until authorization/terms are granted.
4. Public product pages may be used only as ordinary public research unless a rights-cleared collection method is established.

## Status
**Integration candidate / authorization required for production API.** No credentials are stored in the public repository.