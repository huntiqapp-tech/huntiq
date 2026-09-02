# Target public retailer fit — 2026-09-02

Public-policy research only; no account access or undocumented endpoints used.

## Rules relevant to HUNTIQ

- Target Circle bonuses can be personalized, require enrollment, and may require activation/application to a transaction. HUNTIQ should not assume those savings for anonymous users.
- Target Circle Rewards earned from qualifying activity are deferred account value and can be reversed if the qualifying purchase is returned/cancelled. They should not reduce the acquisition cash outlay of the earning transaction.
- Current Target help says bonus progress for online/app orders advances after shipment, pickup, or shopper delivery, reinforcing the distinction between order placement and completed qualification.
- Target Circle Card advertises a 5% discount on eligible Target purchases, but it is payment-method/account dependent and subject to exclusions. Treat it as shopper-qualified acquisition economics, never as universal shelf-price history.
- Target Circle promotions can contain one-per-member and other explicit limits. Persist published caps; when a cap is not published, use HUNTIQ's unknown-promotion-limit model rather than assuming unlimited repeats.
- Target's public Circle materials describe member-only and one-day offers. These are channel/account-qualified promotions and must not rewrite raw store-local price observations.

## Integration implications

1. Preserve raw observed item price separately from Circle/Card/Bonus savings.
2. Mark personalized or activated bonuses as `eligibility=unknown` until customer qualification is verified.
3. Keep future Circle Rewards out of same-transaction cash acquisition cost.
4. Capture offer start/end timestamps and redemption limits when publicly visible.
5. Do not treat membership/payment-method benefits as historical evidence of a permanent retailer price.

Public sources reviewed: Target Help current promotions, Target Circle Bonus help, Target Circle Card page, and Target corporate Circle materials.