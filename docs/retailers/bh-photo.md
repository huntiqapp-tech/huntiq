# B&H Photo Video retailer research

Last public-source review: 2026-09-04

## HUNTIQ modeling rules

- Treat B&H displayed list/MAP/reference pricing as context only. B&H explains that some suppliers impose Minimum Advertised Price (MAP) restrictions and that the lowest selling price can differ from what may be publicly advertised. A struck-through or MAP-constrained reference value must never enter HUNTIQ resale value, profit/ROI, anomaly history, or alert ranking.
- A B&H price match is conditional acquisition economics, not a raw historical shelf-price observation. B&H says eligible price matches require review and, if approved, are delivered by a purchase link valid through the end of the business day. The policy currently allows one approved price match per identical item per customer.
- A post-purchase price adjustment is a possible later refund within the return/exchange period. Do not reduce the current acquisition price until the adjustment is actually approved/received.
- Keep sales tax user/location-specific. B&H says tax is collected based on destination/pickup unless an account is registered tax-exempt. Tax-exempt status must never be assumed for general users.
- Treat trade-in bonuses and instant rebates as separate conditional acquisition components. Trade-in offers can have eligibility rules, combination exclusions, and offer-specific terms; they do not redefine market value or raw shelf-price history.
- B&H supports commercial/professional purchasing programs, but this research does not establish automated collection, retention, or redistribution rights. Do not add a B&H collector or customer-facing B&H data feed without a separate terms/rights review.

## Public sources reviewed

- B&H Pricing Policy — MAP agreements and lowest selling price behavior.
- B&H Price Match Policy — conditional review, approved purchase link, one match per identical item per customer.
- B&H Sales Tax Information — destination/pickup tax and registered tax-exempt accounts.
- B&H Business Leasing Program — commercial/professional customer channel.
- Current B&H trade-in promotion pages — instant rebates/trade-in bonuses and offer exclusions.

## Product implication

B&H is useful for HUNTIQ because MAP behavior is another concrete example of why advertised/reference price is not market value. If B&H is later integrated, HUNTIQ should store the actual paid/selling observation separately from MAP/reference display fields and separately from conditional price-match, rebate, tax-exempt, and trade-in economics.
