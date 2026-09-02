# Sam's Club retailer fit — 2026-09-01

## Public findings

- Sam's Club states that prices, unit prices, and available quantities may vary by club and date. HUNTIQ must preserve club/location identity in every observation and must not blend club-level histories.
- Curbside availability is subject to club inventory and is not guaranteed. HUNTIQ should present inventory as timestamped evidence with freshness/confidence, never as guaranteed stock.
- Instant Savings, Special Buy, and New Lower Price offers can be restricted to a pricing period, club, channel, and prepaid timing. They belong in promotion qualification, not in the unconditional historical shelf-price baseline.
- Instacart delivery is a distinct acquisition channel: Sam's Club says online delivery prices are higher than in-club, members can receive lower prices than non-members, and Instant Savings are not available on Instacart orders. Do not merge Instacart prices with in-club or curbside price history.
- Plus and Club membership levels have different delivery economics. Delivery fees therefore belong in shopper/channel-specific acquisition economics.
- Sam's Club Creator is an official affiliate/creator program. Affiliate payout must remain completely separate from HUNTIQ opportunity ranking. Enrollment/acceptance is required before monetized routing.

## HUNTIQ modeling rules

1. Identity key includes retailer + product + club/location + acquisition channel.
2. In-club, curbside/online, delivery-from-club, and Instacart prices are separate price series unless Sam's Club explicitly establishes equivalence.
3. Membership-only or Instant Savings prices affect acquisition economics only after qualification is known.
4. Delivery/service fees are included in cash outlay for the selected acquisition channel.
5. Inventory is observational and may expire quickly; it never becomes a guarantee.
6. Affiliate commission never affects Flip Score, feed order, anomaly confidence, or alert urgency.

## External requirements

No unrestricted public local-price/inventory developer API was identified in the official public material reviewed in this pass. Sam's Club Creator monetization requires program application/acceptance before production affiliate routing.