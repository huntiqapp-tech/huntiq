# GameStop public source policy

Researched from GameStop public pages on 2026-08-31.

## HUNTIQ rules

- Treat GameStop.com, store pickup, same-day delivery, and in-store observations as distinct fulfillment channels when the displayed price or availability can differ.
- Preserve product condition (`new`, `pre-owned`, `digital`, etc.), platform, edition, and SKU/UPC identifiers. Never compare a pre-owned price directly with a new-item resale comp.
- Preserve membership pricing separately from public pricing. GameStop product pages can display lower GameStop Pro prices, so Pro/member prices must be marked account-qualified rather than generalized as anonymous public prices.
- Availability is part of deal confidence. `Limited Stock`, `unavailable`, pickup eligibility, and delivery eligibility should feed fulfillment confidence rather than being treated as a confirmed purchasable unit.
- Same-day delivery fees are acquisition costs, not merchandise price-history observations.
- Public GameStop pages state that pricing, promotions, and availability may vary by location and at GameStop.com. Therefore local store observations remain store-scoped.
- Pre-owned products must retain condition uncertainty; GameStop notes that pictured items may not represent the exact condition received and that original boxes/manuals may be absent.

## Public evidence used

- GameStop Pre-Owned page: pricing, promotions and availability may vary by location and at GameStop.com; pre-owned guarantee and return language.
- GameStop product pages: condition/platform-specific prices, pickup/same-day-delivery/ship-to-home availability, limited-stock/unavailable states, and same-day delivery fees.
- GameStop product pages also show distinct Pro-member prices and benefits.

## Integration posture

Public pages can be used for manual/public research and semantics. HUNTIQ should not assume a public undocumented endpoint is a supported production feed. Any future authenticated or contractual integration should use the official terms and authorization available at that time.