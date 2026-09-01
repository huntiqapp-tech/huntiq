# Target retailer / monetization fit — 2026-09-01

## Public findings
Target publicly launched Club Target and Target Ambassadors powered by LTK on May 6, 2026. The programs include commission opportunities for eligible creators/ambassadors and confirm that Target is actively investing in creator-commerce attribution.

Target Plus is a seller marketplace with documented seller APIs/resources, but those interfaces are for approved Target Plus sellers and are not evidence of an unrestricted consumer local-store price/inventory API for HUNTIQ.

Target also publicly describes sophisticated internal inventory/supply-chain technology, including its Proxima digital twin, but that is internal capability rather than a public HUNTIQ data feed.

## HUNTIQ decision
- Treat Target as a high-priority retailer for future opportunity discovery because of scale and markdown potential.
- Do **not** assume Target Plus seller APIs grant general local-store consumer price/inventory access.
- Do **not** build Target ingestion around undocumented/private endpoints.
- Keep Target creator/affiliate monetization metadata separate from opportunity scoring and ranking.
- Continue looking for an authorized product/price/inventory partner or data agreement before claiming live Target local availability.

## Architecture fit
Any future Target source must enter HUNTIQ through the normalized retailer-observation contract and carry explicit provider, retrieval timestamp, verification state, evidence quality, retention policy, and redistribution rights before it can be promoted into permanent price history.
