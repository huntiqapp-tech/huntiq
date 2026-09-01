# Micro Center source research

Status: public research complete; production automated ingestion remains disabled until an authorized feed/provider or explicit collection rights are confirmed.

## What HUNTIQ can safely model now

- Micro Center's public support materials say product availability is tied to the selected local store and inventory information is refreshed about every 15 minutes.
- Store selection changes the product selection, local pricing, and availability shown to the shopper.
- Micro Center's published terms for advertised specials state that pricing and availability may vary by retail store and may differ between a retail store and Micro Center Online.
- Some promotional prices may differ from actual purchase price, so HUNTIQ must treat advertised/special price, store purchase price, online price, and member price as separate price contexts when known.
- Member Pricing shown on the public cart experience is an entitlement-specific price and must never be mixed into a general-public baseline.

## HUNTIQ identity rules

Canonical observation key should preserve retailer + product identifier + store + channel + price context + observed timestamp. Never merge one store's history into another store or online history. Preserve whether a price is public, member-only, advertised-special, pickup/store, or online.

## Freshness / alert rules

Because Micro Center describes local inventory as frequently refreshed, inventory evidence should decay quickly. For a future authorized live source, HUNTIQ should prefer observations <=15 minutes old for high-confidence stock claims, downgrade them after 30-60 minutes, and block urgent in-stock alerts when materially stale.

## Collection guardrail

No documented public consumer pricing/inventory API or broad automated-retention right was established in this research pass. Direct automated website collection remains disabled. Future production ingestion requires an authorized API/feed, a rights-cleared third-party provider, or explicit permission. Public pages may still be used for manual/source-behavior research.

## Public references reviewed

- Micro Center support: local inventory is store-specific and refreshed about every 15 minutes.
- Micro Center store/cart experience: selecting a store reveals local pricing and availability.
- Micro Center advertised-special terms: store prices/availability can vary by location and from Micro Center Online.
