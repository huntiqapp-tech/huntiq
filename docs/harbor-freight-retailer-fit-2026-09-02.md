# Harbor Freight retailer fit — 2026-09-02

Public research only. No account access, sign-in, checkout submission, membership purchase, or restricted endpoint use.

## HUNTIQ handling rules

- Coupon discounts are qualified checkout economics, not raw shelf-price history. Public coupon pages show single-use / per-customer limits, validity windows, channel constraints, exclusions, and non-stacking language.
- Inside Track Club prices and early-access offers require membership. HUNTIQ must not assume them for anonymous users; membership-qualified savings stay gated until shopper eligibility is known.
- Online coupon prices can require the coupon code to be entered in cart. Public advertised coupon value can be stored as a promotion candidate, but not as confirmed acquisition cost until qualification is established.
- Harbor Freight's public "Compare to" value is a competitor comparison, not Harbor Freight's own prior regular price. It must never be ingested into HUNTIQ's retailer price-history baseline.
- Public coupon terms say Harbor Freight may correct advertised pricing errors. That makes fulfillment/checkout confirmation especially important for extreme anomaly alerts.
- Restocking fees may apply to designated items and can change. These belong in exit/return-risk economics, not observed shelf price.

## Public sources reviewed

- https://go.harborfreight.com/coupons/2026/07/184612-001/
- https://go.harborfreight.com/coupons/2026/07/184613-001/
- https://www.harborfreight.com/join-inside-track-club.html
- https://www.harborfreight.com/customer-support/returns/restocking

## Integration recommendation

Treat Harbor Freight as a strong public-promotion research target, but keep four evidence classes separate: raw observed price, coupon/member promotion, competitor "Compare to" reference, and fulfillment/checkout confirmation. Never allow "Compare to" values or unverified member pricing to strengthen an anomaly baseline.