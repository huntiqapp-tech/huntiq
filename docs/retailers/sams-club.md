# Sam's Club public retailer research

Reviewed: 2026-09-03

## HUNTIQ modeling rules

- Keep club/store identity attached to every observation. Sam's Club exposes club-specific services and pricing context, and Instant Savings can vary by club.
- Treat Curbside Pickup inventory as evidence, not guaranteed possession. Sam's Club says availability is subject to club inventory and is not guaranteed.
- Preserve promotion windows. Pickup prices for Instant Savings, Special Buy, and New Lower Price items apply only during the specified pricing period and orders must be prepaid within that period.
- Keep markdown/clearance price matching out of baseline history. Sam's Club says clubs may optionally match another club's pricing, but clearance or markdown items are not matched.
- Model Instant Savings as transaction-specific acquisition economics. Savings are membership-linked and automatically applied; not all offers are available in all clubs.
- Separate fulfillment channels. Sam's Club says Delivery from Club uses the same item price as in-club/curbside/online, while third-party Instacart delivery can use higher online prices and does not include Instant Savings.
- Do not infer a nationwide clearance feed from third-party sites. Sam's Club explicitly says it has no affiliated clearance websites.

## Public sources

- Sam's Club Help: Curbside Pickup Prices and Availability
- Sam's Club Help: Curbside Pickup FAQ
- Sam's Club Help search result: Price differences and price matching clubs (updated 2026-05-20)
- Sam's Club Help: How to check Instant Savings
- Sam's Club Help: Delivery From Club FAQ
- Sam's Club Help: Instacart Home Delivery
- Sam's Club Help: Clearance Websites

No account access, scraping bypass, or authentication is required for these public policy rules.
