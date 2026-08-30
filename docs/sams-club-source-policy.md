# Sam's Club public price-source policy

Reviewed: 2026-08-30

HUNTIQ must preserve Sam's Club price observations by club and fulfillment channel instead of pooling them into one history series.

Public Sam's Club help/terms documentation says prices and available quantities can vary by club and date. Curbside pricing is location-dependent, while Delivery from Club currently uses the same member item price as in-club/curbside/online with delivery fees handled separately. Third-party Instacart delivery is different: Sam's Club states online/delivery prices there can be higher than in-club and Instant Savings do not apply.

Implementation rules:

- Store `storeId`/club identity whenever a local club is known.
- Store a normalized `channel` (for example `club`, `pickup`, `delivery-from-club`, `shipping`, `instacart`).
- Never mix third-party Instacart prices into club/pickup baselines.
- Treat delivery fees separately from item price so anomaly scoring measures the merchandise price, while profit/ROI economics include acquisition costs that actually apply.
- Treat unavailable inventory as unavailable/unknown, never as a zero-price observation.
- Preserve offer validity windows when public pages expose them; Instant Savings and special pricing can be time- and club-specific.

This policy does not require account access and does not authorize automated collection methods that violate retailer terms.