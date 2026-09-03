# Home Depot retailer fit — 2026-09-03

Public-source research only; no account access or authenticated endpoint use.

## HUNTIQ modeling decisions

1. **Store-local price identity is required.** Home Depot states that local-store prices may vary from prices displayed online. HUNTIQ should therefore key Home Depot price history by channel plus store/ZIP where location is known, and must not promote one store's clearance/markdown into a national baseline.

2. **Displayed availability is not verified physical inventory.** Home Depot states that products shown as available are normally stocked but inventory levels cannot be guaranteed. Pickup/orderability should remain a fulfillment signal with uncertainty, not a claim that a precise shelf quantity exists.

3. **Price-match eligibility is separate from anomaly value.** Home Depot maintains a separate public Price Match Guarantee. HUNTIQ should not infer that an anomalous local markdown, clearance event, or online/store mismatch is automatically matchable; match eligibility should be represented independently from the observed acquisition price.

4. **Account/Pro value must stay out of anonymous raw price history.** Home Depot publicly advertises Pro Xtra, preferred pricing, paint rewards, perks and bulk pricing. These benefits are user/account/tier dependent, so they belong in qualified acquisition economics rather than the anonymous product-price baseline.

5. **Bulk pricing is conditional economics.** Pro Desk pages advertise bulk pricing and special orders. HUNTIQ may model a bulk-price scenario when a qualifying public price is actually observed, but should not assume a generic Pro discount or reduce acquisition cost without evidence tied to the offer/user state.

6. **Customer-facing confidence labels should reflect the above.** A fresh public store price can still score as an anomaly while inventory confidence is lower. Price confidence, inventory confidence, account-dependent discount state, and alert eligibility should remain separate fields.

## Public sources checked

- Home Depot public Terms of Use: https://www.homedepot.com/c/Terms_of_Use
- Home Depot Price Match Guarantee: https://www.homedepot.com/c/price-match-and-price-check
- Home Depot public pages carrying the standard local-price/inventory disclaimer: https://www.homedepot.com/c/Ratings_and_Reviews_Terms_Of_Use
- Home Depot Pro Xtra terms: https://www.homedepot.com/c/pro-xtra-terms-and-conditions
- Home Depot Pro Desk public pages describing Pro Xtra and bulk/preferred pricing.

## Implementation consequence

For Home Depot observations, prefer an identity like:

`retailer=home-depot | channel=store|online|pickup | store_id/zip when known | sku | observed_at`

Do not collapse store and online histories. Do not convert pickup availability to verified on-hand quantity. Do not apply Pro Xtra/bulk economics unless the specific qualifying price/benefit is known. Keep anomalous-price scoring independent from fulfillment confidence and price-match eligibility.
