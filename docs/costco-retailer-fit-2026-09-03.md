# Costco public retailer-fit notes — 2026-09-03

Public Costco pages support these HUNTIQ modeling rules:

- Costco Business Membership explicitly permits purchases for resale. HUNTIQ should represent membership type/eligibility separately from anonymous observed shelf price.
- Costco.com and warehouse prices are distinct channels. Costco states that Costco.com pricing can include shipping and handling that do not apply to warehouse purchases, and it does not price-match Costco.com orders to warehouse prices. Never merge those histories into one baseline.
- Costco Same-Day prices are marked up above local warehouse prices because the delivery service uses that markup to fund delivery. Same-Day needs its own fulfillment-channel price history.
- Costco.com price-adjustment eligibility is different for resellers: resellers must purchase during valid promotional dates to receive promotional pricing, and item limits can apply. Do not assume a later adjustment is available in reseller acquisition economics.
- Executive 2% rewards and card rewards are distributed later. Newly earned rewards are deferred value, not a reduction to the observed item price.
- Costco Business Members may purchase tax-exempt for resale where state rules allow. Tax-exempt treatment requires the appropriate resale information/documentation and should be modeled as buyer-specific acquisition economics, never anonymous price history.
- Costco also operates bulk/volume programs and liquidation channels. Those are separate acquisition channels and should not contaminate ordinary warehouse or Costco.com retail price history.

Sources:
- https://customerservice.costco.com/app/answers/detail/a_id/847/
- https://customerservice.costco.com/app/answers/detail/a_id/628
- https://sameday.costco.com/store/costco/pages/pricing-policy
- https://customerservice.costco.com/app/answers/answer_view/a_id/693/
- https://customerservice.costco.com/app/answers/answer_view/a_id/1217
- https://www.costco.com/buy-in-bulk.html
