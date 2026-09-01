# Best Buy public-data research

Research date: 2026-09-01

## Useful public signals

Best Buy's public product/open-box pages expose model, SKU, seller, new price, open-box condition and condition-specific price. Example public pages show separate Excellent, Good and Fair open-box prices alongside the new-item price. HUNTIQ should treat these as separate condition markets, never as interchangeable observations for one SKU price history.

Best Buy's current Price Match Guarantee says matching applies to immediately available **new** products sold from Best Buy and excludes Marketplace products, clearance, refurbished and open-box items. It also excludes pricing errors, limited-quantity and out-of-stock items. This is useful evidence for anomaly classification: a price being excluded from price matching is not proof of an error, but it is a retailer-policy signal that HUNTIQ should preserve separately from the observed cash price.

Best Buy lists qualified competitors including Amazon, Apple, B&H, Costco, Home Depot, Lowe's, Menards, Target and Walmart, while excluding third-party marketplace sellers. Cross-retailer consensus should therefore compare first-party identical products and reject marketplace-seller prices by default.

## HUNTIQ normalization rules

1. Store `condition` as `new`, `open_box_excellent`, `open_box_good`, `open_box_fair`, `refurbished`, or `preowned` when exposed.
2. Never feed open-box/refurbished prices into a new-product anomaly baseline.
3. Preserve `seller`; classify Best Buy first-party separately from Marketplace sellers.
4. Treat condition-specific open-box price drops as their own price histories.
5. Require exact SKU/model identity before using Best Buy as a cross-retailer consensus source.
6. Tag clearance/open-box/refurbished/pricing-error-policy exclusions as policy metadata, not as proof that a current price is erroneous.

## Public sources

- Best Buy Price Match Guarantee: https://www.bestbuy.com/site/help-topics/price-match-guarantee/pcmcat290300050002.c
- Best Buy Qualified Competitors: https://www.bestbuy.com/site/price-match-guarantee/qualified-competitors/pcmcat1693426756861.c
- Example public open-box page with condition-specific pricing: https://www.bestbuy.com/product/hisense-65-class-qd6-series-hi-qled-4k-uhd-hdr-smart-fire-tv-2025/J3Z9Z42SQ6/sku/6621207/openbox?condition=fair
