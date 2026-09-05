# Walgreens retailer fit — 2026-09-04

Public-source research only. No account access, credentials, checkout automation, or private data used.

## HUNTIQ modeling rules

- **Keep online and in-store price history separate.** Walgreens' public Pricing Promise says it will honor the lowest price posted on the sales floor for in-store purchases, while internet-advertised prices are excluded because internet pricing may differ from in-store pricing. A Walgreens.com price therefore must not be silently inserted into a store-local raw shelf-price baseline.
- **Treat myWalgreens sale prices as membership-context pricing.** Walgreens says myWalgreens membership unlocks sale prices. Membership-dependent prices belong in promotion/acquisition context and should not be generalized to every shopper or raw universal shelf history.
- **Treat Walgreens Cash as deferred value, not cash acquisition price.** Walgreens states Walgreens Cash is not legal tender, has no cash back, and is for future purchases. It should remain separate from cash paid today unless actually redeemed at checkout.
- **Do not treat pickup availability as secured inventory.** Walgreens instructs customers to wait for the Order Is Ready for Pickup notification. Its current promotion terms also state pickup can be delayed or substituted based on product availability. HUNTIQ should store the selected store, observation time, fulfillment mode, and readiness state separately.
- **Promotion codes remain conditional acquisition economics.** Current Walgreens promotion terms include single-transaction thresholds, account-use limits, category exclusions, channel restrictions, expiration times, and non-stacking rules. Those discounts should never become raw historical shelf-price observations.
- **Substitutions must preserve product identity.** A substituted pickup item is a different acquisition unless exact SKU/variant identity survives the substitution. HUNTIQ should not reuse the original item's resale comps automatically.

## Public source notes

- Walgreens Promotion Terms, retrieved 2026-09-04: https://www.walgreens.com/promotion/offer-details
- myWalgreens overview, retrieved 2026-09-04: https://www.walgreens.com/topic/promotion/mywalgreens.jsp
- Walgreens Store Pickup help, retrieved 2026-09-04: https://digital-dev-afd.walgreens.com/topic/help/pickup.jsp

## Product implication

Walgreens is useful for HUNTIQ because its public policy explicitly demonstrates why retailer name alone is not a sufficient price-history key: channel, selected store, membership/promotion context, timestamp, and fulfillment status materially affect the real acquisition opportunity. Retail reference/promotional claims must remain separate from completed-sale resale value, expected profit, ROI, and alert authority.
