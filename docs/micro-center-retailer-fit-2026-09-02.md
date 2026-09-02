# Micro Center retailer fit — 2026-09-02

## Public findings
- Micro Center exposes store-specific product availability on its public site and says inventory is refreshed about every 15 minutes.
- Store selection matters: availability displayed on product/search pages reflects the selected local store.
- Low-count inventory is explicitly imperfect because units in another shopper's cart may not yet be reflected; pickup reservation is the stronger verification event.
- Price matching requires exact model/UPC identity and has exclusions including clearance, open-box, refurbished, rebates, coupons/promos and special sales.
- Price protection applies when Micro Center itself lowers an eligible product price within the return window, but does not turn an open-box/clearance price into a new-item baseline.
- Member Pricing exists and requires a verified/sign-in account to qualify; it is shopper-qualified promotional economics, not an unconditional shelf-price baseline.

## HUNTIQ modeling rules
1. Keep Micro Center observations store-local. Never blend stock or price history across locations.
2. Treat public stock as a freshness-scored observation, not a guarantee. Reservation/ready-for-pickup confirmation is a stronger fulfillment state than displayed stock.
3. Keep new, open-box and clearance condition histories separate. Open-box/clearance prices must not rewrite the normal new-item baseline.
4. Member Pricing only reduces acquisition cost after membership/sign-in eligibility is known. Unknown eligibility receives the non-member economics.
5. Competitor price-match possibilities are not retailer observations and must not enter Micro Center price history.
6. Price-protection refunds are post-purchase conditional value and must be modeled separately from cash paid at checkout until actually received.

## Integration status
I did not identify an unrestricted official public product/pricing/inventory developer API during this research pass. Public website visibility alone does not grant HUNTIQ retention or redistribution rights, so no undocumented endpoint should be promoted into production history.

## Product opportunity
Micro Center is high-value for HUNTIQ because electronics/computer components have strong resale markets, store-local stock visibility, open-box inventory, and meaningful price volatility. The correct route is rights-cleared public research now and an authorized feed/partner route later if one becomes available.