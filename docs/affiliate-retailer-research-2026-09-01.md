# Public affiliate retailer research — 2026-09-01

## Home Depot

Public Home Depot materials confirm a current Creator program that supports shoppable links and commissions. The public program page advertises up to/at 8% earnings, while Home Depot's Dec. 10, 2025 launch release says accepted creators can generate shoppable links, access product catalogs, track performance, and earn commissions.

HUNTIQ implication: affiliate/deep-link fields belong in the product architecture, but the Creator program is not evidence that an automated deal-discovery PWA is automatically eligible. Do not turn ordinary Home Depot destination URLs into monetized links until HUNTIQ is accepted and the applicable program terms are reviewed for software/app, deal-site, price-comparison, incentive, and data-display rules.

Separate public Home Depot product pages explicitly warn that local store prices may vary and that inventory levels cannot be guaranteed. HUNTIQ should continue to present retailer inventory as reported/uncertain evidence, never as a guaranteed shelf count.

## Staples

Staples publicly operates an affiliate program. Its current public affiliate page states that application is free, approval is required, the referral period is 7 days, and commissions can be up to 8%. Staples says accepted affiliates receive links/creative, promotions and reporting. A separate Staples commission page shows category-dependent rates, including some categories at 0%, so HUNTIQ must store commission eligibility/rate by destination/category rather than assume every Staples sale pays the same amount.

HUNTIQ implication: Staples is a credible future online-deal monetization target. Product ranking must remain independent of commission rate. Affiliate metadata should be attached after opportunity scoring so an otherwise weaker deal never outranks a better deal simply because it pays HUNTIQ more.

## Architecture rule reinforced by this research

Keep these fields separate from the opportunity score: destination_url, affiliate_url, affiliate_network/program, campaign/sub_id, affiliate_eligible, commission_rate/commission_class, and disclosure text. Scoring should use price, evidence quality, anomaly, resale, profit, ROI, downside, liquidity and freshness—not affiliate payout.

## Sources

- Home Depot Creator program: https://creators.homedepot.com/
- Home Depot Creator launch release (2025-12-10): https://ir.homedepot.com/news-releases/2025/12-10-2025-140135946
- Home Depot customer-service/product-page disclaimer language: https://www.homedepot.com/c/customer-service
- Staples affiliate program: https://www.staples.com/lp/staples-affiliate-program
- Staples category commission page: https://www.staples.com/sbd/content/about/affiliate/index.html
