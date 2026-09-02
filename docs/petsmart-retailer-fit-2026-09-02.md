# PetSmart retailer-fit notes — 2026-09-02

Public-source research only; no account access used.

## HUNTIQ modeling rules

- Treat in-store, PetSmart.com, curbside/pickup, ship-to-home, same-day delivery, and third-party marketplace delivery as distinct acquisition channels when prices, selection, fees, membership treatment, or inventory behavior differ.
- PetSmart says prices and selection may vary by store and online. Store-local price history must therefore remain channel/location specific.
- Buy/Get promotions discount the lowest-priced qualifying item(s). Mix-and-match may be disallowed and minimum quantities may apply. HUNTIQ must model cheapest-item discounting, offer-group restrictions, full qualifying quantity, and redemption caps before promotion value enters ROI.
- Spend/Get offers are evaluated after discounts and before tax/shipping; promo codes may be required. Treat them as basket-qualified economics, not raw per-SKU price history.
- Treats Rewards bonus offers require activation and member identification/sign-in. Unknown activation or membership eligibility contributes zero promotional value until verified.
- Treats points earned from a transaction cannot be redeemed in that same transaction. Treat points as deferred value, not an immediate checkout discount.
- Autoship first-order and recurring discounts are conditional on enrollment/sign-in and should be modeled as channel/subscription-specific acquisition terms rather than ordinary shelf-price history.
- PetSmart strikethrough pricing may represent MSRP, median PetSmart.com customer price over the past 90 days, or non-member store retail price. It must not be interpreted as a verified historical regular price without source-specific evidence.
- PetSmart's Price Match Promise excludes free-with-purchase / BOGO offers, rebates, clearance/liquidation/special events and marketplace/reseller prices; matched price is not independent historical evidence for anomaly baselines.

## Public sources reviewed

- PetSmart Promotional Terms — current Buy/Get, Spend/Get, percentage/dollar-off, Treats bonus, Autoship, shipping, same-day and curbside terms.
- PetSmart Treats Rewards Terms & Conditions — points earning/redemption and channel restrictions.
- PetSmart Treats Rewards overview — point earn/redemption structure and membership benefits.
- PetSmart Price Match Promise — eligible competitors and exclusions.

## Integration posture

No unrestricted official public product-price/inventory developer API was identified during this public research pass. Do not promote undocumented/private endpoints into HUNTIQ production history. Affiliate, partner, or future authorized feed access must be reviewed separately for persistence and redistribution rights.
