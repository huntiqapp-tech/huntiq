# Lowe's retailer fit — 2026-09-03

Public Lowe's pages were rechecked on 2026-09-03 for HUNTIQ data-model implications.

## Confirmed public rules
- Lowe's Price Promise validates identical in-stock competitor items at purchase time and includes shipping/delivery cost in the comparison.
- Lowe's explicitly does not price-match one Lowe's store against another, or one Lowes.com ZIP code against another. That strongly supports HUNTIQ keeping store/ZIP price histories isolated rather than treating chain-wide prices as one baseline.
- Price Promise excludes clearance, closeout, damaged merchandise, rebates, BOGO/Buy More Save More, special events, membership/loyalty discounts, volume pricing, third-party marketplace sellers, advertising pricing errors/misprints and several other categories.
- Store Pickup depends on local availability; the customer is notified when an order is actually ready. HUNTIQ should therefore treat pickup/inventory as timestamped availability evidence, not guaranteed inventory.
- MyLowe's Money is not cash back and is redeemed separately from the underlying purchase. HUNTIQ should preserve it as deferred retailer value unless actually applied to the current checkout.

## HUNTIQ implementation rules
1. Keep Lowe's store and ZIP observations isolated in raw price history/anomaly baselines.
2. A competitor price match belongs in acquisition economics after qualification; it must never overwrite the raw Lowe's shelf/web observation.
3. Never infer that a suspected pricing error will be honored through Price Promise; the public policy expressly excludes advertising pricing errors/misprints.
4. Pickup availability must include observation time/location and should decay with age.
5. Rewards/deferred value must not inflate cash ROI unless redeemed in the same qualifying purchase.

Sources: Lowe's Price Promise, Store Services, MyLowe's Rewards and public Lowe's terms pages reviewed 2026-09-03.