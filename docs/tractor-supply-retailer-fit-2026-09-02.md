# Tractor Supply retailer fit — 2026-09-02

Public-source research only; no account access used.

## HUNTIQ modeling notes

- Neighbor's Club is account-linked loyalty value. Public Tractor Supply materials state members earn points on eligible purchases and redeem accumulated points for later rewards. Treat earned points/reward certificates as deferred value, not an immediate reduction to the transaction that earned them.
- Member tiers alter points earning and can add benefits such as shipping/delivery credits. Those benefits belong in account/channel economics, not raw shelf-price history.
- Preferred Plus free standard shipping has a qualifying-order threshold, so shipping savings are order/channel-qualified and should not rewrite product price history.
- Hometown Heroes requires Neighbor's Club membership plus ID.me verification. Identity-qualified savings must remain unknown unless eligibility has actually been verified for the shopper; HUNTIQ should never assume them in public deal ranking.
- Tractor Supply public credit-card material includes an explicit one-off offer limit ('Limit one offer per New Account'), reinforcing the need to model redemption limits as promotion-specific constraints rather than assuming repeatability.
- Public FAQ material includes quantity promotions such as buy-3-get-1-free pet wash benefits. Multi-buy value should remain acquisition economics and must not contaminate single-unit shelf-price anomaly history.

## Sources checked

- https://www.tractorsupply.com/tsc/cms/neighbors-club-faq
- https://www.tractorsupply.com/tsc/cms/neighbors-club
- https://www.tractorsupply.com/tsc/cms/neighbors-club-how-it-works
- https://www.tractorsupply.com/tsc/cms/credit

## Integration posture

No unrestricted official public local-price/inventory API was established in this pass. Continue public-page research and approved data-provider work; do not promote undocumented endpoints to production dependencies.
