# Kohl's public retailer research

Reviewed: 2026-09-04

## HUNTIQ modeling rules

- Keep store and Kohls.com price histories distinct. Kohl's publicly says store prices and Kohls.com prices can differ, while stores may match Kohls.com on an identical item under the price-match policy.
- Treat successful price matches as transaction-specific acquisition economics, not baseline history. Price matching requires identical/verifiable merchandise and can be subject to quantity limits; coupons generally cannot be applied to a price-matched product.
- Preserve condition and seller provenance. Kohls.com competitor matches require the competitor product to be new and in-box; unverifiable details can result in denial.
- Keep earned Kohl's Cash and Rewards out of raw observed price. Rewards are earned after qualifying spend and later issued as Kohl's Cash; promotional Kohl's Cash also has separate earn and redeem windows.
- Do not assume rewards economics are available to resellers. Kohl's Rewards terms explicitly exclude resellers and state Kohl's does not sell to individuals or dealers for resale to others. HUNTIQ must therefore not count Rewards or member-only reward value in a reseller acquisition-cost model unless a future lawful program expressly allows it.
- Treat store pickup as local inventory evidence, not guaranteed possession. Pickup depends on the selected store, variant availability, order processing, and a later ready-for-pickup confirmation.
- Treat pickup incentives as deferred value. Kohl's currently advertises a qualifying $5 Kohl's Cash pickup incentive after pickup; it should not reduce the observed item price.
- Keep price adjustments separate from history. Kohl's allows qualifying sale/regular-price adjustments within two weeks, while clearance and BOGO items are excluded; any successful adjustment belongs to transaction-specific realized acquisition economics.
- Keep third-party same-day delivery as a distinct fulfillment channel because delivery windows, inventory, fees, and fulfillment behavior can vary by provider/store.

## Public sources

- Kohl's FAQ: Price Match Policy
- Kohl's FAQ: Buy Online, Pick Up in Store
- Kohl's Rewards Terms and Conditions
- Kohl's FAQ: Kohl's Cash and Rewards
- Kohl's FAQ: Price Adjustments
- Kohl's FAQ: Same-Day Delivery

No account access, authentication, scraping bypass, or private retailer data is required for these policy rules.