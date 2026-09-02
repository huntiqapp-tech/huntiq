# Tractor Supply — public retailer fit (2026-09-01)

## What is publicly useful to HUNTIQ
- Tractor Supply operates a public affiliate program and routes publishers through Partnerize/Partnerize Management. This is a future monetized outbound-link option only; affiliate economics must remain separate from deal ranking.
- Tractor Supply publishes bulk-discount rules, including category-specific quantity thresholds (for example, certain livestock/animal feed promotions advertise Buy 20, Get 5% off). These are shopper/order-qualification rules and must be modeled as conditional checkout economics, never as raw historical shelf-price observations.
- Smart Supply is a subscription/recurring-order program with recurring discounts and potentially larger first-order offers. Subscription-only discounts must carry eligibility and recurrence context and cannot be generalized to ordinary one-time purchases.
- Tractor Supply vendor resources describe EDI and vendor-only transaction tooling, but no unrestricted public local-store price/inventory developer API was identified in this research pass.
- Tractor Supply announced an Instacart partnership in 2026. Instacart marketplace visibility does not, by itself, grant HUNTIQ rights to persist or redistribute Tractor Supply pricing/inventory data.

## HUNTIQ implementation rules
1. Keep base observed price, qualified bulk discount, subscription discount, tax, and future rewards as separate fields.
2. Quantity discounts must be allocated per unit only after the threshold is actually met.
3. Smart Supply/subscription pricing requires an explicit shopper-qualified flag and must not alter the general store-local historical baseline.
4. Affiliate payout never affects opportunity score, rank, ROI, or alert urgency.
5. Do not treat vendor EDI/private partner interfaces or Instacart presentation data as public API authorization.

## Production blocker
No account action is required now. Affiliate routing would require program acceptance. Any non-public data feed would require the corresponding authorized agreement/credentials before integration.