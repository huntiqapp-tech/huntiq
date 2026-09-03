# Target public retailer-fit notes — 2026-09-03

Public Target help pages support the following HUNTIQ modeling rules:

- Pricing, promotions, styles, and availability may vary by store and online. Keep Target store/location/channel identity attached to every price-history observation.
- In-store clearance pricing is not visible online and is distinct from online clearance. Do not merge online and store clearance histories.
- Target price matching is transaction-specific, requires an identical eligible item and verification, and can be requested at purchase or within 14 days. Treat a successful match as acquisition economics, not as a normal shelf-price observation.
- Clearance, liquidation, damaged/open-box/refurbished items and several promotional structures are excluded from price matching. Preserve those lifecycle/condition flags instead of assuming a match is available.
- Target reserves the right to limit quantities per guest. Quantity optimization must remain bounded by verified purchasable quantity.
- Order Pickup is store-selected and usually becomes ready after fulfillment confirmation. Product-page pickup eligibility is useful inventory evidence but not equivalent to physical possession.
- Target Circle member pricing can require member identity. Personalized/account-specific savings belong in conditional acquisition economics, not anonymous raw price history.

Sources:
- https://www.target.com/help/articles/policies-guidelines/price-match-guarantee
- https://www.target.com/help/article/000062559
- https://www.target.com/help/articles/delivery-options/drive-up-order-pickup
