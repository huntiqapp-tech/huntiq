# Target public-data research

Checked 2026-09-01 against Target Help public pages.

## Normalization rules for HUNTIQ

- Target explicitly says pricing, promotions, styles, and availability may vary by store and online. Preserve `store_id`/location context on every Target observation; do not merge all Target prices into one retailer-wide baseline.
- Online clearance and in-store clearance are separate. Target says in-store clearance pricing is not visible online. A low online clearance price should be classified as `online-clearance`, not evidence that every store has that price.
- Target's Price Match Guarantee covers identical qualifying items when a lower price is found at Target.com, Target stores, or an automatically applied Target Circle deal, generally at purchase or within 14 days. This is useful corroboration metadata, not a substitute for an observed checkout/store price.
- Target says screenshots/pictures are not accepted as proof for a price match; Target verifies the live price. For HUNTIQ, stale screenshots should receive lower evidence confidence than a current public product page observation.
- Target Circle offers can apply automatically when the shopper is identified. Store the base public price separately from member/promotion-adjusted effective price so Circle promos do not contaminate the regular-price history.

## Scoring implications

1. Key Target price-history identity by product + condition + channel + store/location where known.
2. Treat clearance as a promotion state, not automatically a pricing error.
3. Keep `regular_price`, `observed_price`, `promotion_type`, and `effective_price` separate.
4. Give live Target public-page observations higher freshness confidence than screenshots or reposted deal pages.
5. A large drop repeated across several observations should flow through anomaly lifecycle logic and decay from pricing-error suspicion toward persistent markdown/clearance.

Source: Target Help, Price Match Guarantee and Target Circle public help pages (reviewed 2026-09-01).
