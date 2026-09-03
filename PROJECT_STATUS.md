# HUNTIQ — Project Status

Last established from repository and product handoff: 2026-09-03. This is the living handoff and must be updated after meaningful work.

## CURRENT VERSION
- Package: **0.9.61**
- Public PWA preview is functional but still intentionally uses demonstration opportunity data until rights-cleared live integrations are connected.
- Offline cache: **`huntiq-public-v73`**.

## DONE / PRESENT
- Mobile-first installable PWA with offline service worker and browser-persistent watchlist.
- Strict completed-sale resale aggregation in `lib/resale-history.js`; active/asking/cancelled rows cannot contaminate sold-history metrics.
- 30/60/90 resale windows use match/source-quality-weighted effective evidence, IQR outlier filtering, resale freshness and source reliability.
- Channel economics, risk-adjusted profit/ROI, downside P25 economics, confidence-adjusted resale economics and source-adjusted decision-floor economics are integrated in `lib/opportunity-evaluator.js`.
- Acquisition economics separates sticker price, qualified checkout discounts, tax, cash paid today and deferred retailer value.
- Promotion qualification covers membership, coupons, minimum spend, date, channel, stacking, basket rewards, multi-buy rules, redemption caps and mix-and-match restrictions.
- Store-local anomaly scoring uses median baseline, MAD volatility, sample/span strength, freshness, cadence coverage and source reliability.
- Promotion-adjusted/effective-unit prices are excluded from raw shelf-price anomaly history.
- Exact duplicate observation timestamps are collapsed before anomaly baseline/sample scoring.
- **v0.9.41 clock-integrity protection:** price observations more than five minutes in the future relative to evaluator `asOf` are excluded before anomaly baseline/sample/freshness scoring and counted as `futureObservationCount` for audit.
- Capital velocity estimates days-to-sell, sell-through, liquidity, profit/ROI per 30 days and capital-efficiency score.
- Multi-unit exposure checks purchase quantity against 30/90-day completed-sale depth.
- Partial-liquidation economics models expected units sold, remaining units, acquisition capital released/tied up and expected realized profit at 30/60/90 days.
- Resale-decay stress converts weakening 30-day-versus-90-day sold trends into conservative 30/60/90 future exit prices.
- **v0.9.41 marketplace late-sale stress:** `lib/marketplace-late-sale.js` applies configurable fee-rate drift, shipping inflation and holding cost to 30/60/90 liquidation tranches. Its stressed profit/ROI joins the decision-floor candidates, so later units cannot assume today's marketplace costs indefinitely.
- PWA copy now explains both clock-integrity filtering and marketplace-specific late-sale cost stress; the new engine is loaded and offline-cached.
- Alert dedupe/cooldown prevents repeated unchanged alerts while allowing material improvements through immediately.
- Retailer observation contract validates normalized observations and retention/redistribution rights before history promotion.
- **v0.9.47 RetailerAPI shadow ingestion:** `lib/retailerapi.js` builds server-only authenticated product requests, maps valid fresh provider and cross-retailer cells into HUNTIQ's canonical live-observation format, preserves source provenance, rejects stale/indexing/error/malformed cells, deduplicates observations and hard-disables alerts pending live validation. `scripts/retailerapi-smoke.js` performs a credential-gated lookup and prints only a sanitized summary.
- **v0.9.48-v0.9.51 safety integration:** permanent-history promotion requires validated rights/freshness/reliability, recent resale evidence is time-weighted, cross-domain evidence sufficiency constrains alerts, and marketplace cost/ROI floors are enforced in the opportunity decision floor.
- **v0.9.52 RetailerAPI shadow history bridge:** accepted adapter output can now enter the existing live-history/opportunity evaluator in an isolated `shadow-live` state. Repeated observations are deduplicated, provider provenance remains attached, audit rows remain non-redistributable by default, and notifications are unconditionally suppressed.
- **v0.9.53 customer data-state boundary:** every opportunity is classified as live, cached, delayed, demonstration or validation-only before customer rendering. Shadow observations remain hidden, demonstration/cached/delayed rows cannot alert, and only fresh validated live rows can retain decision-floor alert eligibility. The PWA now shows per-card state badges, feed counts and dedicated Live/Demo filters.
- **v0.9.54 inherited mainline:** quantity optimization and opportunity aging/half-life logic are present from merged PR #55. Further scoring and alert-model work is paused while live-data validation is the priority.
- **v0.9.55 inherited mainline:** repeat notifications now require a material opportunity change after merged PR #56. The model is retained, but alerts remain disabled while RetailerAPI validation is incomplete.
- **v0.9.56 inherited mainline:** break-even resilience scoring is present from merged PR #58. Further scoring and alert-model work is paused while live-data validation is the priority.
- **v0.9.57 validated customer payload gate:** `lib/customer-live-payload.js` converts only explicitly validated, customer-display-authorized RetailerAPI assessments into a secret-free PWA payload. It preserves provider provenance and store/ZIP/online identity, rejects unauthorized or secret-bearing rows, classifies freshness, and leaves alerts off by default.
- **v0.9.58 retailer crosscheck gate:** RetailerAPI observations require a fresh, positive-price, product/channel/location-matched retailer crosscheck before permanent history promotion. The higher observed price is retained for conservative acquisition economics, and failed or future-dated crosschecks cannot increase anomaly confidence or enable urgent alerts.
- **v0.9.59 explainable Deal Coach:** `lib/deal-coach.js` converts existing price-history coverage, anomaly confidence, completed-sale depth, resale confidence, liquidity, base/downside/risk-adjusted economics, safe max-buy and alert state into a deterministic BUY/WATCH/SKIP explanation. `lib/deal-coach-runtime.js` renders the explanation on PWA opportunity cards and forces demonstration rows to WATCH so demo evidence cannot look like a live recommendation.
- **v0.9.60 inherited mainline:** unified opportunity-confidence scoring and Deal Coach display are present from direct mainline development. Demonstration data remains capped and alert-ineligible. Additional scoring work is paused while the rights-cleared retailer scraper and authenticated RetailerAPI validation are the priority.
- **v0.9.61 retailer scraper foundation:** the server-only scraper accepts only explicit HTTPS host allowlists, rejects credentials/private targets/redirects/zero prices/stale or future observations, and extracts public JSON-LD or price metadata into canonical shadow observations. A dedicated Home Depot adapter preserves store/ZIP/online identity; the batch runner enforces usage limits, deduplicates observations, records bounded raw provenance and hard-disables alerts and redistribution.

## DATABASE / AUDIT LAYERS
- `db/013_price_history_features.sql` — store-isolated sequential price features.
- `db/016_price_anomaly_assessments.sql` — store-local anomaly/history evidence.
- `db/017_acquisition_economics.sql` — checkout cost and deferred-credit economics.
- `db/018_promotion_eligibility.sql` — promotion qualification.
- `db/019_resale_price_integrity.sql` — completed-sale integrity evidence.
- `db/020_history_coverage_assessments.sql` — cadence/density/gap quality.
- `db/021_resale_freshness_assessments.sql` — completed-sale recency.
- `db/022_source_reliability_assessments.sql` — source-quality snapshots.
- `db/023_evaluator_source_chain.sql` — independent retailer/resale trust chains.
- `db/024_decision_floor_economics.sql` — source-adjusted downside/confidence floor.
- `db/025_basket_promotion_allocations.sql` — basket reward allocation.
- `db/026_multibuy_promotion_evaluations.sql` — quantity promotion economics.
- `db/027_promotion_redemption_limits.sql` — redemption caps and offer groups.
- `db/028_multi_unit_resale_exposure.sql` — purchase-quantity resale exposure.
- `db/029_partial_liquidation_economics.sql` — 30/60/90 units sold, remaining units, capital tied up and realized-profit snapshots.
- `db/030_history_observation_dedup_assessments.sql` — raw versus unique timestamp counts and duplicate exclusions.
- `db/031_resale_decay_assessments.sql` — resale trend, future 30/60/90 stress prices, weighted exit price, decay score and warnings/blockers.
- **`db/032_marketplace_late_sale_stress.sql`** — marketplace late-sale fee/shipping/holding stress plus history clock-integrity assessment storage.
- **`db/038_retailerapi_shadow_history.sql`** — isolated RetailerAPI shadow-history and evaluation audit rows; alert eligibility defaults false.
- **`db/039_deal_coach_assessments.sql`** — explainability audit snapshot linking the recommendation to price-history, anomaly, resale, economics, safe max-buy and alert evidence.
- **`db/040_opportunity_confidence.sql`** — unified opportunity-confidence component, weakest-link, blocker and alert-eligibility snapshots.

## TESTING
- Automated tests cover ingestion, price history, anomalies, economics, resale, evaluator, evidence, alerts, matching, retailer-observation rights and promotion logic.
- v0.9.40 added resale-decay unit/integration coverage.
- **v0.9.41 adds `tests/marketplace-late-sale.test.js`, `tests/marketplace-late-sale-integration.test.js`, and `tests/future-history.test.js`.**
- **v0.9.47 adds `tests/retailerapi.test.js` and a sanitized provider fixture covering authentication request construction, redaction, errors, freshness rejection, cross-retailer normalization, channel separation, deduplication, provenance and the shadow-mode alert gate.**
- **v0.9.52 adds `tests/retailerapi-shadow-history.test.js` covering isolated history evaluation, deduplication, audit provenance and hard alert suppression.**
- **v0.9.53 adds `tests/pwa-data-state.test.js` covering live freshness, cache/delay downgrades, demonstration alert suppression and hidden shadow observations.**
- **v0.9.57 adds `tests/customer-live-payload.test.js` covering validation evidence, display rights, secret rejection, channel/location preservation, freshness downgrades and default alert suppression.**
- **v0.9.58 adds `tests/retailer-crosscheck.test.js` and history-promotion integration coverage for price, identity, channel/location, freshness, future-time and required-crosscheck failures.**
- **v0.9.59 adds `tests/deal-coach.test.js` covering strong-buy evidence, thin-history/resale cautions, safe-max-buy violations, alert explanation and mandatory demo WATCH behavior.**
- **v0.9.60 adds `tests/opportunity-confidence.test.js` covering high-confidence live evidence, thin-history and weak-resale blockers, and mandatory demo alert suppression.**
- **v0.9.61 adds `tests/retailer-scraper.test.js` covering URL/credential protections, structured-data parsing, canonical provenance, Home Depot channel identity, freshness rejection, batch deduplication and hard alert suppression.**

## RETAILER / MARKETPLACE RESEARCH COMPLETED
- eBay Browse API: active asking/product evidence only; not completed-sale history. Marketplace Insights remains restricted.
- Best Buy and Lowe's official developer routes researched; production use requires credentials/terms/onboarding.
- Home Depot, Staples, Ace, Target, Menards, Kohl's, Harbor Freight, CVS, Walgreens, Tractor Supply, Costco, Sam's Club, BJ's, Micro Center, Northern Tool, Dollar General, Office Depot/OfficeMax, PetSmart, Petco, AutoZone and O'Reilly Auto Parts public retailer/promotion rules documented.
- **Advance Auto Parts (v0.9.41):** Advance Rewards replaced Speed Perks in February 2026; points/rewards remain deferred account value unless applied at checkout. Public coupons, rebates, pickup readiness and shipping thresholds stay in promotion/fulfillment economics rather than raw shelf-price history. Affiliate commission remains outside ranking. See `docs/advance-auto-parts-retailer-fit-2026-09-02.md`.
- **DICK'S Sporting Goods (v0.9.59):** public pages confirm online/store pricing and availability can differ, pickup is availability-dependent, price matching is a checkout rule rather than raw shelf history, and promotions can carry manufacturer/category exclusions. HUNTIQ should keep channels isolated, timestamp availability, model approved price matches only in acquisition economics, and keep ScoreCard rewards as deferred value unless redeemed. See `docs/dicks-sporting-goods-retailer-fit-2026-09-03.md`.

## HARD PRODUCT / DATA RULES
- Asking prices are not sold comps.
- Store-local prices stay store-local in anomaly baselines.
- Duplicate observation timestamps cannot increase anomaly sample strength.
- Future-dated observations cannot increase anomaly sample strength or freshness.
- History cadence gaps and clustered observations reduce confidence.
- Completed-sale evidence must be recent and reliable enough to justify current resale economics.
- Retailer-price provenance and resale-sale provenance are separate trust chains.
- Source reliability constrains, never inflates, anomaly/resale confidence.
- Alert urgency is constrained by the worst credible source-adjusted ROI scenario, multi-unit capital exposure, resale decay and marketplace late-sale cost stress.
- Inventory is an observation with freshness/confidence, not a guarantee.
- Affiliate commission never influences ranking.
- Source-specific retention/redistribution terms control persistence.
- Rebates/store credits are not cash-price reductions unless applied at checkout.
- Primary ROI uses actual cash outlay; deferred value is separate.
- Promotion-adjusted effective cost never becomes raw shelf-price history.
- Raw completed-sale evidence remains immutable even when evaluator-level filtering/downweighting excludes it.
- Customer-facing recommendation explanations must be derived from persisted evaluator evidence and must not upgrade demonstration, stale or validation-only data into a live recommendation.
- Public-page scraper output remains ephemeral, non-redistributable and validation-only until retailer terms and retention rights are explicitly approved.

## NEXT — HIGH PRIORITY
- Run the Home Depot adapter only in a trusted server runtime after an explicit terms/robots review; compare sanitized shadow output against the source page before considering any retention or customer display.
- Make the existing RetailerAPI key available to the trusted server runtime as `RETAILERAPI_KEY` and run `npm run smoke:retailerapi`; never place the key in the public repository or browser bundle.
- Manually validate a representative RetailerAPI sample against source retailer pages before promoting shadow observations or enabling alerts.
- Run authenticated RetailerAPI lookup and manual source-page validation, then change only approved observations from `shadow-live` to validated history; keep alerts disabled until that evidence is recorded.
- After authenticated RetailerAPI smoke/manual validation, pass approved assessments through `buildCustomerLivePayload` and inject its opportunities as `HUNTIQ_CUSTOMER_OPPORTUNITIES`; keep `enableAlerts` false through the first validation pass.
- Push source-reliability metadata into each rights-cleared retailer adapter as integrations become available.
- Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history.
- Persist production evaluator/history/promotion/resale/source/alert/Deal Coach snapshots once backend storage is connected.
- Expand actual notification delivery after backend/account architecture is selected.
