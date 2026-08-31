# Retailer research — quantity/local-price implications (2026-08-31)

## Tractor Supply Co.
Official Tractor Supply terms state that prices on the website may vary from other advertised prices because of geographic market conditions, that prices may vary between the site and Tractor Supply stores, and that those prices are not guaranteed to be matched at purchase. Their Best Price Guarantee excludes clearance items. Engineering implication: HUNTIQ must keep `online` and `store` price scopes separate, preserve store identity on observations, and avoid assuming a web price applies locally. Clearance observations should not be inferred from ordinary price-match rules.

Source: https://www.tractorsupply.com/tsc/cms/policies-information/customer-solutions/terms-and-conditions-of-use

## Harbor Freight
Harbor Freight's public store directory advertises Clearance items as limited-time / while-supplies-last offers alongside weekly deals and Parking Lot Sales. Engineering implication: inventory confidence and observation freshness matter heavily for alert ranking; quantity should be treated as per-store, time-sensitive evidence rather than a durable catalog property.

Source: https://www.harborfreight.com/storelocator/store-directory

## HUNTIQ rule added from this research
When a retailer's public terms or store experience indicate local pricing or while-supplies-last availability, HUNTIQ should not multiply unit profit by reported shelf quantity without a demand/fulfillment cap. Quantity-aware purchase planning now limits recommended units by observed availability, fulfillment confidence, resale demand capacity, user cash budget, and optional maximum units.