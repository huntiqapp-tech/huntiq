# Sam's Club retailer research

Researched: 2026-09-01

## Public behavior relevant to HUNTIQ

- Sam's Club states that prices, unit prices, and available quantities may vary by Club and by date.
- Curbside availability is tied to club inventory and is not guaranteed.
- Instant Savings can vary by club location and pricing period.
- This makes Sam's Club a strong fit for HUNTIQ's existing retailer + product + store/ZIP observation identity and freshness-aware inventory model.

## API / access status

Sam's Club exposes a developer site for Advertising Partners, including a Catalog Item Search API for advertiser catalog items. That API is advertising/campaign oriented and requires authorization; it is not evidence of a general public price-history or store-inventory API for HUNTIQ.

## Collection guardrail

The current Sam's Club Terms of Use restrict use of engines, software, tools, agents, spiders, robots, avatars, or intelligent agents to navigate/search the site beyond the site's own search agents and generally available browsers, and separately prohibit data matching/data mining. Direct automated collection from samsclub.com should therefore remain disabled unless Sam's Club grants permission or HUNTIQ receives the data through a rights-cleared provider/feed.

## HUNTIQ implementation status

- Location-aware schema compatibility: YES
- Public/manual price context: YES
- Direct automated site ingestion: DISABLED
- Advertising-partner API as retail price-history source: NO
- Rights-cleared third-party/provider ingestion: ELIGIBLE after rights review
- Community-submitted observations: ELIGIBLE subject to contributor terms/provenance rules
