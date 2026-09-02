# Costco public retailer rules — 2026-09-02

Public-source findings for HUNTIQ retailer modeling:

- Costco states online prices may exceed warehouse prices; Same-Day prices are marked up above local warehouse prices. Treat warehouse, Costco.com, and Same-Day as separate price channels.
- Business Membership explicitly allows purchases for resale. Resale economics should therefore distinguish personal/member pricing from business-resale eligibility instead of treating all membership value identically.
- Costco.com price adjustments within 30 days exclude/limit resellers: resellers must buy during valid promotional dates and promotional limits apply. Do not assume a future adjustment credit in reseller ROI.
- Membership cards are non-transferable and account-linked benefits are qualification-dependent; anonymous HUNTIQ economics must not count membership rewards unless the user has the qualifying membership.
- Costco may expose warehouse inventory in its app, but app inventory should be modeled as retailer-reported availability, not verified shelf count.
- 2% Executive rewards are deferred/account-dependent value and should remain outside raw acquisition price history unless explicitly modeled as qualified customer economics.

Sources: Costco Member Privileges and Conditions; Costco Customer Service price-match/adjustment guidance; Costco Same-Day pricing policy; Costco membership pages.