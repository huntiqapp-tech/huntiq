# Menards public-source policy — 2026-09-01

## Why Menards is useful to HUNTIQ
Menards public product pages expose several fields that can improve deal detection without requiring account access: SKU/model identifiers, everyday price, time-bounded rebate amount, value-after-rebate, pickup/delivery signals, and in some cases a recent-purchase popularity signal.

## Price semantics
Treat **Everyday Low Price** as the immediate transaction price unless a page explicitly shows another point-of-sale sale price. Do **not** treat **Value After Rebate** as the cash acquisition price.

Menards states that its rebate is not an instant reduction at purchase. The rebate is mailed as a Rebate Credit Check usable toward future in-store merchandise purchases, not purchases on MENARDS.COM. Therefore HUNTIQ should model rebate value separately from cash paid.

Recommended normalized fields:
- `cash_price`: advertised immediate purchase price.
- `rebate_value`: advertised mail-in rebate amount.
- `rebate_kind`: `future_store_credit`.
- `effective_price_after_rebate`: cash price minus advertised rebate value, shown only as a secondary economic scenario.
- `rebate_expires_at`: offer end date when published.
- `rebate_realization_factor`: configurable probability/discount factor rather than assuming 100% realization.

For reseller economics, calculate both `cash_roi` and `rebate_adjusted_roi`. Alerts should rank primarily on cash economics and may show rebate-adjusted upside separately.

## Inventory / fulfillment semantics
Product pages can expose `Pick Up At Store`, `Delivery Available`, `FREE SHIPPING TO STORE`, `Check Another Store for Availability`, or `Not available for purchase online`. These are fulfillment signals, not guaranteed unit counts.

Normalize them into channel flags and attach moderate confidence unless a selected-store page provides a stronger explicit stock statement. A product that is not purchasable online may still be a valid local-arbitrage candidate if a store-pickup or store-visit path is indicated.

## Demand signal
Some public pages display statements such as “X People have purchased this in the past week.” Treat this as a retailer-originated short-window popularity feature, not a resale-market sold count. It can modestly raise demand confidence but must not be mixed with eBay/marketplace sold-comparable counts.

## Anomaly-scoring rules
1. Compare the immediate cash price to historical immediate cash prices.
2. Compare rebate-adjusted price only to historical rebate-adjusted observations with equivalent rebate semantics.
3. A newly introduced or enlarged rebate should not by itself be labeled a pricing error.
4. Reward corroboration when a low immediate price and a separate rebate overlap, while preserving both components in the evidence trail.
5. Down-rank expired rebate pages or cached offers whose `Good Through` date has passed.

## Public references checked 2026-09-01
- Menards Rebate Center: explains that rebates are mail-in Rebate Credit Checks for future in-store purchases and are not instant point-of-sale discounts.
- Current public product pages show Everyday Low Price, rebate amount, Value After Rebate, offer validity dates, fulfillment signals, SKU/model identifiers, and on some products weekly-purchase popularity text.

No credentialed endpoint or private account data is required for these public-page semantics. Automated collection still needs normal rate limiting, robots/terms review, and source-specific monitoring before production scale.
