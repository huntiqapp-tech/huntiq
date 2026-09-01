# Dollar General public-source research

Updated 2026-09-01.

## Findings

- Dollar General states that product availability, promotions and prices may vary between stores and online. HUNTIQ must isolate store, ZIP and channel observations instead of blending them into one baseline.
- Dollar General's app advertises local weekly deals and in-store item scanning. Historical DG terms also describe pickup pricing as matching the selected pickup store, reinforcing the need for store-specific identity.
- Dollar General Terms & Conditions, last updated March 2, 2026, prohibit data extraction, scraping/mining, creating a database by downloading or storing site/app content, and scraping/collecting/storing product listings, descriptions, prices or images outside the granted license.

## HUNTIQ policy

Direct automated collection from dollargeneral.com or the DG app is disabled. Public pages may be used for manual research context only. Production observations require an authorized API, licensed/rights-cleared provider, explicit permission, or user-contributed observations collected under HUNTIQ's own terms. Preserve `retailer/storeId/ZIP/channel/observedAt/source/verified` on every observation. Treat in-store/pickup, delivery and online prices as separate channels.