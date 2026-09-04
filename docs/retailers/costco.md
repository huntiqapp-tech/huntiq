# Costco public retailer rules

Research refreshed 2026-09-04 from Costco public customer-service pages. No member/account-only data was used.

## HUNTIQ modeling rules

- Keep **warehouse and Costco.com price history separate**. Costco says online pricing may differ from local warehouse pricing because of warehouse-only promotions and shipping costs. Do not blend these into one national baseline.
- Treat **warehouse inventory and price as location + timestamp evidence**. Costco says its warehouse inventory/pricing lookup can be delayed by up to 30 minutes, is subject to change, and out-of-stock items may disappear from results. Availability therefore is not guaranteed possession.
- Treat **Same-Day/Instacart as a separate channel**. Costco says Same-Day item prices are marked up above local warehouse prices and requires a $35 minimum. The markup is fulfillment economics, not proof that the warehouse shelf price increased.
- Preserve **original warehouse sell price separately from delivery markup** when available. Costco says Executive rewards on Same-Day orders are calculated on the original warehouse sell price before the markup.
- Costco explicitly supports legitimate **resale/tax-exempt workflows**, subject to state rules and documentation. Warehouse Business Members may qualify based on resale licenses/tax-exempt status. Costco.com requires appropriate resale/tax-exemption documentation and processes qualifying tax refunds after purchase rather than assuming exemption at checkout.
- Never assume tax exemption for a HUNTIQ user. Apply it only when user/account-specific eligibility has been validated.

## Public sources

- Costco Customer Service, “Are warehouse and online prices the same?” updated 2026-05-28: https://customerservice.costco.com/app/answers/detail/a_id/691/
- Costco Customer Service, “How do I check warehouse inventory and prices?” published 2026-01-06: https://customerservice.costco.com/app/answers/detail/a_id/1015066/
- Costco Customer Service, “Same-Day Delivery Powered by Instacart FAQs”: https://customerservice.costco.com/app/answers/detail/a_id/8150/
- Costco Customer Service, “Can I purchase for resale or tax exempt at a Costco warehouse?”: https://customerservice.costco.com/app/answers/detail/a_id/1217
- Costco Customer Service, “How do I purchase for tax exempt or resale on Costco.com?”: https://customerservice.costco.com/app/answers/answer_view/a_id/693/
