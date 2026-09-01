# Harbor Freight public-data research

Reviewed 2026-08-31.

## What is useful to HUNTIQ

- Harbor Freight has 1,600+ US stores and its public store locator accepts ZIP-code searches, so store/ZIP identity belongs in HUNTIQ observations.
- Public pages advertise Instant Savings, clearance, Parking Lot Sales and other limited-time pricing.
- Open Box and As-Is inventory is sold exclusively in stores; selection and quantity vary by store. That makes it especially interesting for local opportunity discovery, but also means stale inventory should be confidence-decayed aggressively.
- Harbor Freight states that its public "Compare to" reference represents a similar-function item advertised by another US retailer at or above that price within the previous 90 days. That field is reference context only; it is not Harbor Freight price history or resale sold evidence.

## Production ingestion decision

Do not enable a first-party automated Harbor Freight collector yet. Public pages establish useful store-aware semantics but did not surface a documented public pricing/inventory API or explicit automated retention rights in this research pass. HUNTIQ may ingest Harbor Freight through a rights-cleared provider, explicitly authorized feed, or user/community observations with provenance.

## Modeling notes

Use retailer + product + store/ZIP as the price-history identity. Treat Open Box / As-Is as condition-specific observations and never mix their price baselines or resale comps with new-condition items. Keep "Compare to" in reference-price metadata and exclude it from anomaly-history baselines and verified resale comps.