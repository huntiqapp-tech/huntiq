# CVS / Walgreens promotion modeling — 2026-09-01

Public retailer terms reinforce HUNTIQ's promotion-eligibility model.

## Walgreens
- myWalgreens membership can be required for sale pricing and promotional rewards.
- Promo codes may require a minimum transaction value, account sign-in, product eligibility, channel eligibility, and may prohibit combination with other promo codes.
- Walgreens Cash rewards are future-purchase value, not legal tender/cash, and should not be modeled as an immediate checkout-price reduction when newly earned.
- Walgreens Cash can carry redemption limits, expiration, excluded categories, and return effects.
- Therefore HUNTIQ should store the observed shelf/list price independently from shopper-specific promotion eligibility and from future reward value.

## CVS
- ExtraCare rewards accrue separately from the purchase and are made available for later redemption; exclusions apply to qualifying spend/reward earning.
- Therefore newly earned ExtraBucks should be treated as deferred value unless explicitly applied in the current checkout.

## HUNTIQ rules reinforced
1. Member-only pricing may enter acquisition economics only when membership eligibility is confirmed.
2. Coupon-required pricing may enter acquisition economics only when coupon application is confirmed.
3. Minimum-spend, expiration, item/channel eligibility, and non-stacking constraints must be validated before discount value is applied.
4. Unconfirmed promotion value is excluded from profit/ROI rather than optimistically assumed.
5. Future rewards remain separate from cash paid today and from store-local raw price history.
6. Alerts depending on unconfirmed promotion qualification cannot be `instant`.

Public sources reviewed: Walgreens Promotion Terms, myWalgreens program information/terms, and CVS ExtraCare Terms & Conditions.