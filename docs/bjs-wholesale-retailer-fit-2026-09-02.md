# BJ's Wholesale Club retailer fit — 2026-09-02

## Public findings

BJ's public membership and delivery pages confirm several pricing/economics rules relevant to HUNTIQ:

- Same-Day Delivery requires location eligibility and its standard fee starts at $9.99 but may vary by location, order size, item value, and delivery time.
- Digital coupons must be clipped/applied to the member account before they reduce a same-day order.
- Club+ members earn 2% back on eligible net BJ's purchases, which is deferred membership reward value rather than an immediate reduction of the shelf price.
- Pickup can have a fee for sub-$50 orders depending on membership/payment status.
- Delivery availability and prices can fluctuate with location, seasonal availability, and demand.
- BJ's explicitly supports member-specific savings and business memberships, so shopper qualification and channel must remain separate from the raw observed store price.

## HUNTIQ modeling rules

1. Keep in-club price, pickup price, same-day delivered economics, and ship-to-home economics as separate acquisition channels when fees differ.
2. Do not treat Club+ 2% rewards as checkout discounts. Model them as deferred rewards with realization assumptions.
3. Do not apply digital-coupon savings until coupon eligibility/application is confirmed.
4. Delivery and pickup fees belong in acquisition economics, not price history.
5. Availability is location-specific and not guaranteed; confidence must decay with age and source reliability.
6. No undocumented/private endpoints. A public page that exposes a price is evidence, but long-term storage/redistribution rights must be established separately.

## Integration status

Research-only. No credentials or account access are required for this analysis. HUNTIQ should wait for an authorized feed/API/data agreement before treating BJ's as a durable production retailer source.