# Home Depot live customer boundary — 2026-09-04

## Public-source findings

Current Home Depot public pages state that local store prices may vary from displayed prices and that products shown as available are normally stocked but inventory levels cannot be guaranteed. Home Depot product/category pages also show delivery and availability varying by ZIP code.

Sources checked 2026-09-04:
- https://www.homedepot.com/c/price-match-and-price-check
- https://www.homedepot.com/b/Building-Materials-Insulation-Foam-Board-Insulation/1/Interior-Exterior/XPS/N-5yc1vZbaxxZ1z0w1xoZ1z0y5ksZ1z11cv0

## HUNTIQ modeling consequences

1. Home Depot observations must remain store/ZIP/channel scoped. A web price observed for one selected location cannot become a national shelf-price fact.
2. Availability is evidence, not a possession guarantee. Customer presentation should preserve the observation timestamp and location context.
3. Delivery/pickup ZIP differences belong to fulfillment and landed-cost economics; they must not rewrite raw shelf-price history.
4. Bright Data Home Depot rows remain shadow-only until provider authentication, manual source comparison, retention rights and customer-display/redistribution rights all pass the existing provider-validation review.
5. Even after customer-display promotion, history persistence remains separately gated. Display authorization alone cannot silently create permanent price history.
6. Completed-sale resale evidence remains independent of retailer MSRP/list/regular/compare-at claims. Retail reference prices cannot improve profit, ROI, recommendation or alert eligibility.

## v0.9.86 implementation note

`lib/customer-live-payload.js` now accepts either `retailerapi` or normalized `bright-data` batches after the same validated provider boundary. The payload rejects provider-provenance mismatches, requires a provider record identifier and customer-display authorization, and keeps live alert eligibility dependent on the existing readiness gate.

This change does not claim that a Bright Data Home Depot dataset is currently licensed for HUNTIQ customer redistribution. It only removes an internal code mismatch so a future rights-cleared validation can flow through the same safe customer boundary without a separate ad-hoc path.
