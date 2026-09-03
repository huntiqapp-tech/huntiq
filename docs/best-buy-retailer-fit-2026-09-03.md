# Best Buy public retailer/data-source fit — 2026-09-03

Public-source research only; no Best Buy account, developer key, or authenticated endpoint was used.

## HUNTIQ modeling decisions

1. **Best Buy has an unusually useful official API, but its rights are restrictive.** The public Developer Portal says the Products API exposes the full current/historical catalog, including pricing, availability, specifications, descriptions, and images, with most product information updated near real-time. Stores and Products can also be queried together for in-store availability.
2. **Do not treat the official API as a permanent HUNTIQ price-history feed without separate permission.** Best Buy's API terms say API Content may only be stored/cached temporarily for up to 72 hours. They also prohibit using the Service/Content on behalf of a third party such as other retailers for analyzing Best Buy pricing/products/services. HUNTIQ must therefore keep any future Best Buy API integration rights-gated and must not promote API observations into permanent history unless Best Buy grants appropriate rights or a separate signed agreement applies.
3. **The API still has strong validation value.** Subject to the terms, a rights-compliant integration could provide near-real-time pricing, catalog identity, product attributes, images, store metadata, and availability for temporary validation/display. The public operational policy currently lists 50,000 calls/day and 5 calls/second for Products, Reviews, Stores, Categories, Recommendations, and Buying Options.
4. **Open-box is a separate acquisition/resale condition.** Best Buy's Buying Options API publicly advertises Open Box inventory with condition and reduced-price data. Open-box prices must never be blended with new-product price history or new-condition resale comps.
5. **Price-match rules help classify anomaly risk.** Best Buy's Price Match Guarantee, effective January 16, 2026, excludes clearance, open-box, refurbished/pre-owned, pricing errors, limited-quantity items, member/loyalty pricing, coupon offers, and multiple other promotion types. HUNTIQ should model these as acquisition opportunities with verification/cancellation risk, not as guaranteed matchable prices.
6. **Member rewards/prices are conditional economics.** As of June 4, 2026, Best Buy says Plus and Total members earn 1% back on eligible purchases, with separate credit-card rewards and exclusive member pricing. These values are account/payment dependent and belong in qualified acquisition economics rather than anonymous raw price history.
7. **Official-source priority:** for Best Buy product identity and temporary validation, an authorized official API is materially preferable to fragile scraping if HUNTIQ can satisfy the developer terms. Permanent historical storage, cross-retailer analysis, and redistribution remain separate rights questions.

## Public sources checked

- Best Buy Developer APIs: https://developer.bestbuy.com/apis
- Best Buy Developer Portal: https://developer.bestbuy.com/
- Best Buy API Terms / Operational Policy: https://developer.bestbuy.com/legal
- Best Buy Price Match Guarantee: https://www.bestbuy.com/site/help-topics/price-match-guarantee/pcmcat290300050002.c
- Best Buy June 4, 2026 rewards announcement: https://corporate.bestbuy.com/2026/reward-points/
- Best Buy Outlet FAQ: https://www.bestbuy.com/site/outlet-refurbished-clearance/outlet-stores-faqs/pcmcat748301999410.c

## Implementation consequence

Keep Best Buy source metadata explicit: `source=bestbuy_api|bestbuy_public_page`, product condition, channel/store identity, retrieval timestamp, retention class, redistribution class, and alert eligibility. Default official-API retention to `temporary_72h` unless rights are upgraded. Never merge open-box and new-product histories or member-exclusive pricing into anonymous public baselines.
