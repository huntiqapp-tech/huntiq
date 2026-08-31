# CVS + Walgreens public price semantics — 2026-08-31

## CVS
CVS's public Online Shopping FAQ says online prices, sales, and specials are not always the same as in-store prices, prices may vary from store to store, and CVS.com does not expose store merchandise/prices in that FAQ flow. CVS product pages also warn that prices may vary online versus in store.

### HUNTIQ implication
- Never promote a CVS online price into a universal store price.
- Keep `price_scope=online` and `price_scope=store` isolated.
- A lack of store price visibility online is missing evidence, not evidence that a local clearance deal does not exist.
- Hunter receipt/store-scan observations can provide first-party local evidence and should be cross-checked through `price-consensus` before alert escalation.

Official sources:
- https://www.cvs.com/retail/help/help-subtopic-online-shopping-faqs
- https://www.cvs.com/retail/help/help_faq

## Walgreens
Walgreens' public site states under its pricing promise that internet-advertised prices may differ from in-store prices. Its promotions help page says stores may price-match Walgreens.com regular price on request, but excludes online sale/promotional pricing and several other categories; a team member validates the price and screenshots/printouts are not proof.

### HUNTIQ implication
- Treat Walgreens online and store observations as distinct scopes even when the SKU is identical.
- Do not assume an online promotion is claimable in store.
- For alerting, store-local evidence should outrank an online-only observation when the opportunity is described as an in-store flip.
- Conflicting online/store observations should lower price-consensus confidence rather than being averaged into one price.

Official sources:
- https://www.walgreens.com/
- https://digital-dev-afd.walgreens.com/topic/help/shophelp/promotions_help.jsp
