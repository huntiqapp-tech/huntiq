# DICK'S Sporting Goods — public retailer fit (2026-09-03)

## Public facts verified
- DICK'S states that products, pricing, promotions, exclusions and availability may vary between in-store and online and can change without notice.
- DICK'S public product-availability page exposes pickup/availability concepts and notes that product detail pages carry availability timing.
- The public site advertises one-hour curbside/in-store pickup, subject to availability.
- The public site advertises a Best Price Guarantee / price match program.
- Current public promotion copy includes category-specific exclusions and manufacturer restrictions, so a displayed promotion cannot be assumed to apply universally.
- ScoreCard rewards are deferred loyalty value, not an automatic cash-price reduction at checkout; keep rewards outside raw shelf-price history unless actually redeemed in the transaction.

## HUNTIQ modeling rules
1. Treat online and store-local prices as separate channels. Never let an online price become a store-local anomaly baseline without an explicit store match.
2. Availability is a timestamped observation, not a guarantee. Preserve observed-at time and pickup/store identity.
3. Price-match eligibility is a checkout rule, not raw historical shelf price. Model an approved match in acquisition economics only after eligibility/validation.
4. Manufacturer/category exclusions and coupon restrictions belong in promotion qualification. Unknown eligibility must not lower acquisition cost.
5. Loyalty rewards are deferred retailer value unless redeemed at checkout; they cannot inflate primary cash ROI.
6. Pricing-error language means extreme anomalies require crosscheck before customer escalation; do not treat a web typo as confirmed inventory or a guaranteed transaction.

## Integration posture
- Public research only until HUNTIQ has an explicitly permitted data-access route or retailer authorization.
- No account access is required for the rules above.
- Do not implement systematic automated extraction based solely on public pages without a rights/terms review.

## Sources checked 2026-09-03
- https://www.dickssportinggoods.com/s/product-availability-price
- https://www.dickssportinggoods.com/
- https://www.dickssportinggoods.com/home/terms
