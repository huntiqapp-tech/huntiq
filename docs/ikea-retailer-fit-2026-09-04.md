# IKEA U.S. retailer modeling notes — 2026-09-04

Public-source research only. No account access was used.

## HUNTIQ modeling rules

- IKEA states that prices can change during the year and that a prior price is not automatically honored once no longer valid. Treat each observed price as timestamped evidence, never as a durable guarantee.
- IKEA offers post-purchase price adjustments: generally 14 days for purchases, extended to 90 days for IKEA Family members when the membership number was used on the original transaction. A later adjustment is transaction-specific acquisition economics and must not rewrite the original public shelf-price observation.
- IKEA Family points are earned after qualifying activity/purchases and can take time to post. Points themselves are non-transferable, non-refundable and cannot be exchanged for cash. Newly earned points are deferred value, not an instant reduction in raw item price.
- Once points unlock a reward, the member chooses a reward code. Product/service rewards can reduce checkout cost when actually redeemed; that redemption belongs in buyer-specific acquisition economics. Online and phone transactions permit one reward per transaction, while stores may permit multiple rewards from different categories.
- Reward codes are single-use and expire after a limited redemption window. HUNTIQ should not assume future reward availability in baseline ROI.
- IKEA Family rewards and price-adjustment benefits are membership/account dependent. Public price history must remain separate from member-specific effective acquisition cost.

## Product implications

1. Preserve raw observed IKEA price in price history.
2. Record redeemed IKEA Family reward value only in checkout economics.
3. Record newly earned points/rewards as deferred value with zero immediate cash-price effect.
4. Do not count a possible future 14/90-day price adjustment in opportunity profit or ROI until the adjustment is actually received/verified.
5. Keep customer alerts fail-closed when a deal only works after assuming unearned rewards or a speculative future price adjustment.

## Public sources reviewed

- IKEA U.S. price guarantee / price adjustment help page (current as checked 2026-09-04).
- IKEA U.S. Rewards from IKEA Family overview and help pages (current as checked 2026-09-04).
- IKEA Family Program Terms and Conditions, last updated 2025-11-06.
