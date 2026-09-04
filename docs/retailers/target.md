# Target public retailer rules

Research refreshed 2026-09-04 from Target public Help pages. No Target account or member-only data was used.

## HUNTIQ modeling rules

- Keep **store-local, Target.com and Target Plus evidence distinguishable**. Target says pricing, promotions, styles and availability may vary by store and online; Target Plus Partner items cannot be price matched to Target-sold items.
- Do not blend **in-store clearance** into online clearance history. Target says online clearance pricing is separate and in-store clearance pricing is not visible online.
- Bind app-observed prices to the **current store location**. Target says the app must show the current store location for a store price match, and price matching to a different Target store is excluded.
- Treat a Target price match or post-purchase adjustment as **conditional acquisition economics**, not a raw shelf-price observation. Eligible identical-item adjustments may be requested at purchase or within 14 days and require verification.
- Treat **Target Circle deals** as promotion/account-context evidence. Some Circle deals require member identification and personalized savings may differ, so they must not become universal historical prices.
- Treat Drive Up / Order Pickup availability as **location-specific fulfillment evidence**. Drive Up is offered only at select stores through the Target app, and the order is not considered secured until Target sends the ready-for-pickup notification.
- Preserve substitution state separately from exact-product availability for pickup orders. A substitute does not count as inventory evidence for the originally identified SKU.

## Public sources

- Target Help, Price Match Guarantee: https://www.target.com/help/articles/policies-guidelines/price-match-guarantee
- Target Help, Drive Up & Order Pickup: https://www.target.com/help/articles/delivery-options/drive-up-order-pickup
- Target Help, How do I place a Drive Up or Order Pickup order?: https://www.target.com/help/article/000062613
