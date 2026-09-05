# CVS retailer fit — 2026-09-05

Public-source research only. No account access, credentials, checkout automation, or private data used.

## HUNTIQ modeling rules

- **Keep CVS online and store-local price history separate.** CVS states that online prices, sales and specials are not always the same as in-store prices and that prices may vary from store to store. Retailer identity alone is therefore not a sufficient price-history key.
- **Treat ExtraCare sale prices and personalized deals as membership-context acquisition economics.** CVS says ExtraCare members receive sale prices and can receive personalized deals. Those prices should not be generalized into a universal shelf-price baseline.
- **Treat ExtraBucks as deferred promotional value, not cash.** CVS states ExtraBucks Rewards have no cash value and are not redeemable for cash. HUNTIQ should only lower current acquisition cash cost when a reward is actually redeemed in that transaction; earned future rewards remain separate value.
- **Preserve coupon/reward eligibility and expiration context.** CVS says coupons and ExtraCare Rewards are applied in-cart and expired coupons cannot be used. Conditional or expired discounts must not contaminate raw price history.
- **Keep fulfillment channel economics separate.** CVS notes that selection and prices can differ between online and in-store offerings, and same-day/third-party delivery can have different reward and promotion eligibility. Delivery economics should therefore remain a separate channel layer rather than altering store shelf history.

## Public sources

- CVS Online Shopping FAQs, retrieved 2026-09-05: https://www.cvs.com/retail/help/help-subtopic-online-shopping-faqs
- CVS ExtraCare Terms & Conditions, retrieved 2026-09-05: https://www.cvs.com/extracare/free/terms
- CVS ExtraCare overview, retrieved 2026-09-05: https://www.cvs.com/extracare/overview

## Product implication

CVS reinforces HUNTIQ's evidence model: store, channel, membership status, promotion eligibility, coupon redemption, timestamp, and fulfillment method can all change the real acquisition economics. None of those should be confused with completed-sale resale value, expected net profit, ROI, or urgent-alert authority.