# Menards source policy research — 2026-08-31

## Public findings

Menards' public pickup documentation is explicitly store-aware: shoppers select a preferred store, can locate stores by ZIP code, and pickup availability is tied to that selected location. Inventory can change during the day, so availability should be treated as time-sensitive rather than durable truth.

Menards also exposes a public API Developer Portal hosted on Azure API Management. The portal labels production access as **Prior Authorization Required**. That is an important signal for HUNTIQ: an official integration path appears to exist, but production collection should remain disabled until authorization and applicable API terms are obtained.

## HUNTIQ architecture decision

- Model Menards observations with the existing `retailer | product | store/ZIP` identity.
- Treat store availability as freshness-sensitive evidence, not permanent inventory history.
- Do not build an undocumented direct scraper as the production source while an official authorized API path exists.
- Keep a Menards adapter interface provider-neutral so authorized API access or a licensed data provider can be plugged in later.
- Store price-history observations only when the selected provider's rights permit retention.

## Public sources

- Menards Buy Online & Pick Up at Store: https://www.menards.com/main/services/buy-online-pick-up-at-store/c-12969.htm
- Menards API Developer Portal: https://developer.apim.menards.com/
- Menards Store Locator: https://www.menards.com/store-details/locator.html

## Status

Candidate retailer: **promising, authorization required for official production API**.
No credentials or account action are needed until HUNTIQ is ready to request/activate authorized production access.