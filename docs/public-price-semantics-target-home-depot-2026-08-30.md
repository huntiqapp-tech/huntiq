# Public price semantics: Target and Home Depot

Research date: 2026-08-30

## Target

Target's public pricing help page says its `Was` strikethrough price is based on the **90-day median price** offered on Target.com and the Target app, excluding sales, clearance and other limited-time promotions. It also states that online prices may differ from local-store prices.

HUNTIQ implications:

- Preserve store/online scope on every observation; do not mix local-store and online history into one baseline unless explicitly modeling a cross-channel reference.
- Median-based historical baselines are aligned with a major retailer's own customer-facing price-history semantics and are preferable to naive averages for anomaly detection.
- Treat a displayed `Was` value as retailer-provided reference evidence, not as a substitute for HUNTIQ's independently observed history.
- Clearance and limited promotions should remain distinct event labels because Target excludes them from its 90-day `Was` reference calculation.

Public source: Target Help, Pricing details: https://www.target.com/help/article/000194850

## Home Depot

Home Depot's public Pro quote page says quoted cart/list/product pricing can be locked for seven days after a quote is created. Its 2026 Pro announcements also describe preferred pricing and inventory availability in authenticated Pro experiences.

HUNTIQ implications:

- A user-authenticated quote is not a general public price feed and must never be treated as one.
- If HUNTIQ later supports user-authorized Pro data, quote prices should carry a `quoteValidUntil` or equivalent time boundary and remain separate from anonymous/public observations.
- Preferred/account-specific pricing must be labeled as account-scoped evidence rather than generalized to all shoppers.
- Public retailer research can document these semantics now; live account-scoped ingestion must wait for explicit authorization.

Public sources:

- Home Depot, How to Create a Quote: https://www.homedepot.com/c/create-a-quote
- Home Depot 2026 Pro digital experience announcement: https://ir.homedepot.com/news-releases/2026/03-18-2026-203026077

## Engineering policy

HUNTIQ should keep `channel`, `storeId`, `accountScope`, `sourceFamily`, `observedAt`, and any validity window attached to price observations. Baseline confidence should reward independent observations and source diversity while suppressing rapid duplicate polling, so repeated checks of the same unchanged price cannot masquerade as corroboration.