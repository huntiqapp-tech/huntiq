# Target public retailer rules — 2026-09-05

Public-source modeling notes for HUNTIQ. No account access required.

## Pricing and history

- Target states that pricing, promotions, styles, and availability may vary by store and online.
- Online clearance and in-store clearance are separate; in-store clearance pricing is not visible online.
- The Target app must show the current store location for an in-store price match.
- HUNTIQ should therefore preserve store/location + channel on Target observations and never merge all Target observations into one national price-history baseline.

Source: https://www.target.com/help/articles/policies-guidelines/price-match-guarantee

## Price-match economics

- Eligible Target purchases may be matched to a lower identical Target.com, Target store, or qualifying Target Circle price at purchase or within 14 days.
- Identity includes brand, size, weight, color, quantity, and model number.
- Target can decline a match it cannot verify; in-store matches from other Target stores are excluded.
- Target Circle deal proof requires member identification.
- HUNTIQ should model price matching as conditional acquisition economics, not as observed shelf-price history or guaranteed acquisition cost.

Source: https://www.target.com/help/articles/policies-guidelines/price-match-guarantee

## Pickup and inventory

- Target says Order Pickup is usually ready within two hours, with some stores taking up to six hours.
- Customers receive a ready-for-pickup email/notification when the order is actually ready.
- HUNTIQ should treat displayed pickup availability as possible fulfillment only. A ready notification or stronger order confirmation is higher-grade fulfillment evidence than a product-page pickup badge.

Sources:
- https://www.target.com/help/article/000063262
- https://www.target.com/help/article/000062559
- https://www.target.com/help/articles/delivery-options/drive-up-order-pickup

## Search/cached-price caution

Target warns that comparison-shopping/search engines can show outdated prices because of web caching and says the correct price is on Target.com. HUNTIQ should not promote search-engine snippets into verified Target price history without a direct current-source observation.

Source: https://www.target.com/help/article/000055613
