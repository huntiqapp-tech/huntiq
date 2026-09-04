# Target public retailer research — 2026-09-04

## HUNTIQ modeling decision
Target should be modeled as a **location/channel-sensitive retailer**. A single global Target price is not a safe historical truth because Target states that pricing, promotions, styles and availability may vary by store and online, and that some items differ between locations because market conditions vary by store.

### Price-history identity
- Keep store observations isolated by store/location and channel.
- Do not merge another Target store's lower price into the current store's raw price history.
- Online clearance and in-store clearance are separate; in-store clearance pricing is not visible online.
- If the Target app is used as evidence for a store observation, preserve the store location shown by the app.

### Price-match economics
Target may match qualifying Target.com, Target-store or automatically applied Target Circle deal prices at purchase or within 14 days, subject to exclusions and verification. HUNTIQ should therefore model an approved price match as an **acquisition-cost adjustment**, not as a rewrite of the observed shelf-price history.

A price-match path is conditional, not guaranteed inventory value. Clearance, closeout, liquidation, damaged/used/open-box/refurbished items, gift-card offers, many coupons, bundled/minimum-purchase offers and other listed categories are excluded. HUNTIQ should not advertise those excluded cases as expected price-match savings.

### Personalized and membership pricing
Target states that guests may see different prices through personalized Target Circle savings and offers. These should be stored as customer/account-specific acquisition adjustments when actually eligible, not as universal market prices or resale values.

### Quantity / execution risk
Target reserves the right to deny purchases and limit quantities per guest. HUNTIQ quantity recommendations should therefore treat displayed availability as an upper-bound signal until checkout/fulfillment confirms purchasable quantity.

### HUNTIQ trust rule
Target reference prices, regular prices, promotion banners and percentage-off claims remain context only. They cannot establish resale market value, profit, ROI or alert eligibility. Completed-sale resale evidence remains authoritative for market value.

## Public sources checked
- Target Price Match Guarantee: https://www.target.com/help/articles/policies-guidelines/price-match-guarantee
- Target pricing disclosure/help: https://www.target.com/help/article/000194850
- Target Plus Partner price match policy: https://www.target.com/help/article/000197749

Research here records public product-modeling facts only. It does not grant scraping, redistribution or commercial data rights; any integration requiring account access, contract terms, API credentials or paid data remains a separate approval step.
