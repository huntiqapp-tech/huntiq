# Lowe's retailer fit — 2026-09-02

Public-research notes for HUNTIQ. No account access was used.

## Price Promise / channel rules

- Lowe's Price Promise applies to an identical in-stock item from another local retailer or qualifying online retailer, with validation at the time of purchase.
- The comparison includes shipping or delivery cost.
- Clearance, discontinued, used/refurbished/open-box/damaged merchandise, rebates, BOGO / Buy More Save More offers, one-time promotions, loyalty/military pricing, volume/wholesale pricing, membership wholesalers, marketplace sellers, auction sites, tax promotions, advertising errors and financing offers are excluded.
- Lowe's says one store will not match another Lowe's store, and Lowes.com will not match pricing across ZIP codes.
- Lowe's reserves the right to limit price-match requests to reasonable quantities.

### HUNTIQ modeling

1. Keep Lowe's store- and ZIP-specific observations isolated in price history. A price from another Lowe's store/ZIP must never become the baseline for the target location.
2. Treat a successful Price Promise as qualified checkout economics, not as a raw shelf-price observation.
3. Do not assume a competitor price match for clearance/price-error opportunities—the policy specifically excludes those classes.
4. Unknown or discretionary quantity limits must remain an acquisition-risk constraint for multi-unit buys.

Source: https://www.lowes.com/l/about/price-promise

## MyLowe's Rewards / MyLowe's Money

- Public Lowe's materials describe MyLowe's Rewards as tiered, with points earned per dollar and benefits varying by tier.
- MyLowe's Money is account-linked reward value. Consumer members receive $5 once 500 points accumulate; Pro rewards use a different points/redemption structure.
- MyLowe's Money is applied to a later eligible purchase from the customer's account wallet and has an expiration window.
- Pro reward earning requires account/member identification; 2026 public terms also describe point-expiration periods.

### HUNTIQ modeling

1. Points earned by a purchase are deferred account value and must not reduce that purchase's cash acquisition cost.
2. Existing MyLowe's Money can reduce cash outlay only when the shopper is authenticated/eligible and the reward is actually applicable at checkout.
3. Tier shipping/delivery benefits are customer/channel-qualified fulfillment economics, not product-price history.
4. Reward expiration means deferred value should not be treated as cash-equivalent without a haircut/expiry state.

Sources:
- https://www.lowes.com/l/shop/mylowes-money-days
- https://www.lowes.com/l/Pro/pro-benefits
- https://corporate.lowes.com/newsroom/press-releases/lowes-launches-mylowes-rewards-loyalty-program-aimed-helping-diyers-get-more-value-when-they-choose-lowes-for-their-home-improvement-needs-01-10-24

## Product consequence for HUNTIQ

Lowe's is a strong example of why HUNTIQ must keep four values separate:

- observed shelf/web price,
- location-specific historical baseline,
- qualified checkout price after an approved match/reward,
- deferred loyalty value earned for future use.

That separation protects anomaly scoring from promotion contamination and keeps profit/ROI based on cash actually paid today.
