# Walmart public retailer fit — 2026-09-02

Public-policy research only; no account access or undocumented endpoints used.

## Rules relevant to HUNTIQ

- Walmart store and Walmart.com pricing are distinct channels. Walmart.com does not price-match Walmart store prices; eligible U.S. stores may match an identical in-stock Walmart.com item subject to restrictions and manager approval.
- Store price matching can be limited to one item per customer per day, so a displayed online price is not automatically a repeatable multi-unit acquisition price in store.
- Walmart Marketplace seller promotions can require sign-in, can have redemption quantity limits, and can include mix-and-match quantity savings from the same seller. These are checkout-qualified promotion economics and must not rewrite raw shelf-price history.
- Walmart+ free shipping/no-order-minimum applies to qualifying Walmart-sold/shipped items and some select Marketplace items; delivery-from-store has separate location, slot, inventory and minimum-order rules. Shipping/delivery benefits therefore belong in fulfillment/channel economics, not the item-price baseline.
- Marketplace and third-party seller prices are excluded from Walmart store price matching. HUNTIQ must keep first-party Walmart evidence separate from Marketplace seller evidence.

## Integration implications

1. Keep store-local, Walmart.com first-party and Marketplace-seller price histories isolated.
2. Treat price-match eligibility as a conditional acquisition path, not as a normal observed store price.
3. Persist published quantity caps; when a cap is unknown, use HUNTIQ's unknown-limit state rather than assuming unlimited repetitions.
4. Keep membership shipping benefits and delivery fees in channel economics.
5. Preserve seller identity for Marketplace promotions so mix-and-match logic does not cross unrelated sellers.

Public sources reviewed: Walmart corporate price-match policy, Walmart Help Extra Savings, and current Walmart+ benefits/terms pages.
