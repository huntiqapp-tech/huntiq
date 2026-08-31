# Target public-data fit for HUNTIQ

Checked: 2026-08-31

## What Target exposes publicly

Target's consumer site/app exposes store-specific item availability and lets shoppers change stores by ZIP/city to review local stock status. Target also states that local availability changes quickly and is not guaranteed. Pricing may differ between online and local-store purchases.

Target's pricing help page is useful for interpreting reference prices: its `Was` price is based on the 90-day median price offered on Target.com/app, excluding sales, clearance, and other limited-time promotions. This makes the displayed reference useful as context, but it is not a substitute for HUNTIQ's own rights-cleared price history.

## Automated collection restriction

Target's current Terms & Conditions prohibit automated navigation/search mechanisms other than Target-provided search agents, generally available browsers, or approved Agentic Commerce Agents. They also prohibit data extraction/scraping/mining and systematically downloading or storing product listings, descriptions, prices, or images except as permitted by the terms.

Therefore HUNTIQ should **not build a direct Target scraper** or a permanent Target price-history database from automated Target.com collection without separate permission/authorized access.

## HUNTIQ policy

- Treat Target.com/app as manual/public research context only unless authorized access is obtained.
- Do not use automated Target scraping for production ingestion.
- Do not persist Target product/price content into HUNTIQ history from an unauthorized collector.
- If an approved Target agent/API/partner path becomes available, review its data-use and retention terms before enabling ingestion.
- User-contributed Target observations can remain a separate first-party/community path when contributor rights and provenance are explicit.

Sources:
- https://www.target.com/c/terms-conditions/-/N-4sr7l
- https://www.target.com/help/articles/product-support-services/product-availability
- https://www.target.com/help/article/000194850
