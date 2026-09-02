# Office Depot / OfficeMax retailer fit — 2026-09-02

Public-source research only. No account access, private endpoint use, or credentials were used.

## HUNTIQ modeling rules

- Keep ordinary shelf/list price history separate from Rewards Member Price. Office Depot says member price applies only to Rewards members and online members must be logged in to receive it.
- Do not assume coupon stacking with Rewards Member Price. Office Depot states coupons/free-gift offers cannot be combined with Rewards Member Price; the better applicable value wins.
- Treat ordinary 2% Rewards earnings and Bonus Rewards as deferred value, not an immediate checkout discount. Rewards certificates are issued later and expire.
- Bonus Rewards may require a coupon and can be limited to one transaction. Until the qualifying coupon/transaction conditions are confirmed, HUNTIQ should assign zero promotional value.
- Delivery thresholds and delivery fees belong in channel acquisition economics, not raw item price history. Current published delivery terms distinguish qualifying-order thresholds and minimum fees, with same-day delivery treated separately.
- A basket-threshold free gift or prepaid reward card is an order-level promotion. HUNTIQ must allocate or separately value it at basket level rather than crediting the whole reward to a single SKU.

## Sources reviewed

- Office Depot OfficeMax Rewards Program Terms and Conditions, dated July 7, 2026.
- Office Depot help: Members-Only Savings, updated January 12, 2026.
- Office Depot help: Rewards Certificates.
- Office Depot Delivery Options, dated July 31, 2026.

## Integration posture

This research establishes consumer-facing promotion and channel rules only. It does not establish permission to persist or redistribute Office Depot price/inventory data and does not identify an unrestricted public consumer price-history API. Any production ingestion must still pass HUNTIQ's retailer observation rights/provenance contract.
