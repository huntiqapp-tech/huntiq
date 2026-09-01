# AutoZone public retailer research — 2026-09-01

## Public signals useful to HUNTIQ

AutoZone publicly exposes store-local fulfillment semantics that matter for deal verification. Its Store Pickup page says customers can select a store, order ahead, and check nearby stores when an item is unavailable at the selected location. Store pickup is explicitly subject to availability. Its Same Day Delivery page says eligibility is determined by the selected store and eligible product pages carry a same-day-delivery signal.

## HUNTIQ normalization rules

1. Treat AutoZone inventory/fulfillment as store-scoped. Do not infer national availability from one store.
2. Persist `store_id` / location with every observed offer when the source provides it.
3. Keep pickup, same-day-delivery, and ship-to-home availability as separate fulfillment states.
4. A store-local availability change must not be interpreted as a price anomaly by itself.
5. Rewards value is not cash price. AutoZone Rewards currently issues a $20 reward after five qualifying purchases of $20 or more; that future account reward must stay outside the observed shelf/web price and core anomaly baseline.
6. Personalized or account-only rewards/offers must never be used as a universal HUNTIQ price.

## Collection posture

This research confirms useful public semantics but does not establish a rights-cleared bulk product/pricing API. Keep direct automated production collection disabled until an authorized feed/provider, explicit retailer permission, or other clearly permitted source is available. Public pages can still be used for manual/public research and normalization design without account access.

## Sources reviewed

- AutoZone Store Pickup public page (reviewed 2026-09-01)
- AutoZone Same Day Delivery public page (reviewed 2026-09-01)
- AutoZone Rewards public page (reviewed 2026-09-01)
