# Harbor Freight public-source policy — 2026-08-31

HUNTIQ treats Harbor Freight public prices as retailer observations, not as evidence that every displayed comparison number is Harbor Freight price history.

## Price semantics
- Preserve item/SKU identity, condition, observed channel, store/location context when available, and observation timestamp.
- Treat ordinary advertised price, Instant Savings, clearance/as-is, open-box, coupon price, and Inside Track Club member price as distinct promotional/condition states.
- Member-only Inside Track Club pricing is qualified pricing and must not be generalized to anonymous shoppers.
- Coupon discounts that apply only after a code/register action are stored as conditional acquisition opportunities, not silently substituted into the ordinary merchandise-price baseline.
- Harbor Freight's `Compare to` value is a competitor comparison. Harbor Freight says it represents a same/similar-function item advertised by another U.S. retailer at or above that price within the prior 90 days. HUNTIQ must never treat `Compare to` as Harbor Freight's own former price, MSRP, or verified resale value.
- Error-language in coupon terms means an advertised price can be corrected; extreme anomalies therefore remain candidates until current availability/checkoutability is corroborated.

## Availability and fulfillment
- `In stock`, `while supplies last`, presale-eligible, and unavailable are different fulfillment states.
- A missing or unavailable item is never recorded as a zero-dollar observation.
- Store-scoped clearance/as-is inventory must not contaminate a nationwide product baseline.

## Resale identity
Harbor Freight item numbers, brand, model/variant, quantity, bundle state, and condition should flow into HUNTIQ's product matcher. Open-box/as-is comps are not interchangeable with new-condition sold comps.

## Public evidence reviewed
- Harbor Freight public coupon pages state that Inside Track Club offers are member-only, can be in-store/in-stock only, may exclude open-box items, and can be non-stackable.
- Harbor Freight coupon terms explain the `Compare to` definition and reserve the right to correct pricing errors.
- Harbor Freight's public store directory describes Instant Savings as limited-time pricing.

No account access is required to apply these source-semantics rules.