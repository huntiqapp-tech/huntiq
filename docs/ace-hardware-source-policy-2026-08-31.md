# Ace Hardware source policy research — 2026-08-31

## Public findings

Ace Hardware's public shopping flow is store-aware. Its site supports local-store selection, store pickup, curbside pickup, and store fulfillment. Public pages state that participating-store availability matters and that prices and availability can vary and change without notice. Ace also operates thousands of locally owned locations, so a product observation should be scoped to the selected store rather than treated as a single national truth.

Ace publicly offers an affiliate program, but the public materials reviewed here describe referral links, banners, sales reporting, and commissions rather than a general-purpose product pricing/inventory API. That means HUNTIQ should not infer broad automated collection rights from affiliate participation alone.

## HUNTIQ architecture decision

- Model Ace observations with the existing `retailer | product | store/ZIP` identity.
- Treat pickup/availability as freshness-sensitive evidence because local stock can change quickly.
- Keep price observations store-scoped because public Ace pages explicitly warn that prices, promotions, styles, and availability may vary.
- Do not build a production direct scraper unless Ace terms or another authorized provider clearly permit automated collection and historical retention.
- Keep a provider-neutral Ace adapter so a future approved affiliate feed, licensed provider, or official integration can plug into the same price-history pipeline.

## Public sources

- Ace homepage / local shopping: https://www.acehardware.com/
- Ace Ready in 15 / store pickup: https://www.acehardware.com/ready-in-15
- Ace affiliate program: https://www.acehardware.com/affiliates
- Ace affiliate FAQ: https://www.acehardware.com/affiliate-faq

## Status

Candidate retailer: **useful and strongly location-aware, but automated production ingestion remains disabled until data-use and retention rights are explicit**.

No credentials or account action are required for this research stage.