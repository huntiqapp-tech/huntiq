# Costco retailer fit — 2026-09-01

## Public-source findings
- Costco is fundamentally membership-gated for warehouse shopping, so a displayed warehouse deal may depend on an active membership rather than being universally purchasable.
- Costco's own public product/savings pages state that selection and pricing can vary, that availability is not guaranteed, and that online pricing may be higher than warehouse pricing. HUNTIQ therefore must keep warehouse/store identity and channel (`warehouse`, `online`, `same-day`) separate in price history.
- Costco promotions can have household quantity limits and date windows. Those constraints belong in promotion qualification / acquisition economics rather than the raw shelf-price baseline.
- Costco's Executive Membership reward is a later annual reward on eligible purchases. It must not be treated as an instant reduction in cash paid for the transaction that earned it.
- No unrestricted public Costco developer API for local warehouse price/inventory was identified in the official public material reviewed for this research pass. Do not infer permission to use undocumented/private endpoints.

## HUNTIQ modeling rules
1. `warehouse price != online price != same-day price` unless the source explicitly establishes equality.
2. Warehouse observations require a warehouse/location key before entering anomaly history.
3. Membership-dependent purchase eligibility must be represented separately from product price.
4. Quantity limits and date windows must be carried into opportunity feasibility and acquisition economics.
5. Annual membership rewards are deferred value, not checkout discounts, and must never inflate primary cash ROI.
6. Public Costco pages may be used as retailer-verification evidence only under the applicable source rights; technical accessibility is not blanket permission for systematic persistence or redistribution.

## Integration status
Research-only. No production data adapter should be enabled until a rights-cleared source or authorized commercial relationship exists.
