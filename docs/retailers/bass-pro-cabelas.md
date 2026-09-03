# Bass Pro Shops / Cabela's public retailer rules

Research refreshed 2026-09-03 from public Bass Pro Shops pages.

## HUNTIQ modeling implications

- Outdoor Rewards points are deferred value, not an immediate checkout-price reduction. Public help says points earned on purchases can be redeemed for future merchandise; therefore raw price history should store the actual observed item price before future rewards.
- CLUB points likewise behave as future reward value and should remain separate from raw shelf/web price history and immediate cash acquisition cost unless already redeemed on the current transaction.
- Business-account discounts are handled through Bass Pro Shops Business Sales and are not available through ordinary retail stores/websites, so HUNTIQ should model that as a separate business-sales channel rather than contaminating consumer price history.
- Bass Pro/Cabela's offer price matching, but a matched price is transaction-specific acquisition economics, not evidence that the retailer's ordinary historical price changed.
- Rewards/payment eligibility is account- and transaction-dependent. Unknown qualification should not be assumed in reseller economics.

## Public sources

- https://help.basspro.com/club-mastercard-outdoor-rewards-loyalty-programs-5a99132c/what-is-outdoor-rewards-311a4168
- https://help.basspro.com/club-mastercard-outdoor-rewards-loyalty-programs-5a99132c/howwhere-can-i-earn-club-points-48d67daf
- https://help.basspro.com/company-information-e8cd63ea/will-bass-pro-shops-match-prices-d3f661b0
- https://www.basspro.com/shop/en/b2b-contact-us%20
