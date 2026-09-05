# IKEA public retailer rules — 2026-09-05

## HUNTIQ modeling decisions

- **Keep price history location/channel scoped.** IKEA US terms state that prices and availability can change without notice, website pricing can differ from mobile/app/store/catalog/marketing pricing, and pricing can differ from store to store. HUNTIQ must not collapse IKEA observations into a single national baseline.
- **Treat price adjustments as conditional acquisition economics.** IKEA currently describes a 14-day adjustment window for general purchases and 90 days for IKEA Family purchases when the member number was used in the original transaction, subject to proof of purchase and current/ongoing promotion criteria. A potential adjustment is not a historical shelf price.
- **Do not treat stock display as secured inventory.** IKEA says in-store stock is first-come, first-served and cannot be reserved. Click & Collect is the stronger fulfillment state, but customers are told to wait for the ready-for-pickup email before traveling.
- **Keep membership offers separate from universal price history.** IKEA Family offers require membership identification, and program terms allow benefits/offers to vary by member or subset. These are entitlement-context acquisition economics.
- **Preserve exact fulfillment location.** Click & Collect selection is tied to a chosen pickup location/date and capacity. Store/local availability should remain part of the evidence identity.

## Public sources reviewed

- IKEA US Terms & Conditions — prices/availability can change, channel pricing may differ, and pricing may differ store-to-store.
- IKEA US Click & Collect FAQ — order/pay online, choose location/date based on capacity, wait for ready email.
- IKEA US price guarantee / price adjustment FAQs — 14-day general and 90-day IKEA Family adjustment conditions.
- IKEA US item reservation FAQ — in-stock merchandise is first-come, first-served and cannot be held/reserved in store.
- IKEA Family Program Terms — offers and points depend on membership identification and may vary by member/subset.

## Product consequence

For IKEA, HUNTIQ should rank a deal from the **actual observed sellable price and verified location/channel context**, not MSRP/reference messaging. Promotional/member adjustments may lower acquisition cost only after their entitlement conditions are satisfied; displayed stock alone must not increase alert confidence to a secured-inventory state.
