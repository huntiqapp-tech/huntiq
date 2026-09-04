# Sam's Club retailer fit — 2026-09-04

## Decision

Sam's Club remains useful for HUNTIQ deal discovery, but price observations must be keyed by club, date, fulfillment channel, and membership context. Resale itself is contemplated in Sam's Club terms for members using valid resale/tax-exempt credentials, so this retailer is materially different from sources whose terms broadly prohibit resale purchases.

## Public-source findings

1. Sam's Club states that prices, unit prices, and available quantities can vary by Club and date. Curbside price is determined by the applicable online/payment-time rules, and weighted goods settle against actual purchased weight. HUNTIQ must therefore keep club/date/channel observations separate rather than collapsing them into one national price history.
   Source: https://help.samsclub.com/app/answers/detail/a_id/4075

2. Curbside Instant Savings, Special Buy, and New Lower Price pricing is only effective during the specified pricing period; Instant Savings can vary by club and may not be available everywhere or online. HUNTIQ should model these as bounded promotion/acquisition states, not permanent historical shelf-price baselines.
   Source: https://help.samsclub.com/app/answers/detail/a_id/347/kw/item

3. Instant Savings are membership-linked and automatically applied at checkout. Offers may have redemption limits and can vary by club. The discount should therefore be represented as eligibility-aware acquisition economics; it must not become universal market value.
   Sources: https://help.samsclub.com/app/answers/detail/a_id/520 and https://help.samsclub.com/app/answers/detail/a_id/526

4. Direct Delivery from Club currently uses the same low member prices as in-club for Express, while delivery fees vary by membership and speed. Current published fees include $10 one-hour Express and $5 three-hour-or-less for Plus, versus $22 and $17 for Club members. Those fees belong in landed acquisition cost, not the product's raw price history.
   Sources: https://help.samsclub.com/app/answers/detail/a_id/4087 and https://help.samsclub.com/app/answers/detail/a_id/4034

5. Instacart is a distinct channel: Sam's Club says online Instacart prices can be higher than in-club, members receive lower prices than non-members, and Instant Savings are not available through that channel. HUNTIQ must not merge Instacart observations with direct club/direct-site observations.
   Source: https://help.samsclub.com/app/answers/detail/a_id/2829

6. Plus members can earn 2% Sam's Cash on eligible pre-tax purchases, currently capped at $750 per membership year. Sam's Cash is a user/membership benefit and should be modeled separately from raw item price and resale value. If HUNTIQ later includes it in acquisition economics, it should be applied only when eligibility and remaining annual capacity are known.
   Sources: https://help.samsclub.com/app/answers/detail/a_id/4092 and https://help.samsclub.com/app/answers/detail/a_id/382

7. Sam's Club terms expressly address members buying merchandise for resale and using resale permits/tax-exempt credentials. That means HUNTIQ does not need to classify Sam's Club itself as a no-resale retailer based on the public terms reviewed here. Tax treatment remains user-specific and must not be assumed automatically.
   Source: https://help.samsclub.com/app/answers/detail/a_id/4078/kw/Gazebo/related/1

## HUNTIQ modeling rules

- Identity key: retailer + club/location + SKU + channel + observed timestamp.
- Raw price history: actual member/club/direct-channel item price only.
- Promotion layer: Instant Savings, Special Buy, New Lower Price, limited-time/member-specific offers.
- Landed-cost layer: delivery/shipping/service fees and applicable taxes.
- User-specific benefit layer: Sam's Cash and other membership rewards.
- Never use a stated regular/list/reference price as resale value, anomaly baseline, profit input, ROI input, or alert justification.
- A promotion or membership benefit may improve acquisition economics but cannot alter completed-sale market value.
- Instacart and direct Sam's Club observations remain separate channels.
