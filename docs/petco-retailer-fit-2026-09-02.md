# Petco retailer fit — 2026-09-02

## Public findings

- Petco's current pickup promotion applies only to qualifying buy-online/pickup-in-store items, is reflected in cart, excludes shipped items and specified brands/categories, and may not combine with other offers. Treat this as channel- and item-qualified checkout economics, never as a universal shelf-price reduction.
- First Autoship discounts are limited, channel-specific and non-stackable with Buy One Get One offers. Autoship therefore needs its own acquisition channel and qualification state.
- Petco Perks / Vital Care includes member-only pricing and rewards. Points are tied to the member account and are redeemable toward eligible future purchases; rewards therefore remain deferred value until actually applied to a later checkout.
- Current Petco Perks terms effective June 22, 2026 state that points are redeemed toward eligible future purchases. Online redemption requires the shopper to be logged in.
- Petco pickup availability is store-specific. If pickup is unavailable, Petco directs customers to contact the local store for availability. HUNTIQ must therefore model pickup inventory as a store/channel observation, not a guarantee.

## HUNTIQ rules

1. Keep in-store, shipped, pickup/curbside, Autoship and third-party/on-demand channels separate when their prices, discounts or fees differ.
2. Member pricing and Petco Perks redemption enter acquisition economics only after shopper eligibility/account qualification is confirmed.
3. Earned points/rewards are deferred value; they do not reduce the cash cost of the transaction that earned them.
4. Pickup-order discounts may reduce cash acquisition cost only for confirmed eligible pickup items in a qualifying cart.
5. Non-stackable offers must be resolved before economics; do not add multiple advertised discounts together optimistically.
6. Store/pickup availability is evidence with freshness and confidence, not guaranteed inventory.
7. No unrestricted public developer API for local Petco price/inventory was established in this research pass; do not rely on undocumented endpoints.

## Public sources reviewed

- Petco Help / promotion and price-match terms.
- Petco Vital Care / Petco Perks membership pages.
- Petco Perks Program Terms & Conditions, effective June 22, 2026.
- Petco store locator and pickup/on-demand help pages.
