# HUNTIQ autonomous invariant integration audit

This file is a PM review map, not an agent instruction source. Autonomous agents cannot modify it or the tests it names.

The explicit autonomy gate runs `tests/autonomy-invariant-integration.test.js` before the full suite. That test imports the same production modules consumed by HUNTIQ customer and economics paths and also asserts that the shipped PWA still sends supplied customer data through the production authority classifier.

| Product invariant | Production path exercised | Required proof |
| --- | --- | --- |
| Customer evidence fails closed | `app.js` -> `HuntIQDataState.classifyOpportunityData`; `lib/pwa-data-state.js`; `lib/customer-live-payload.js` | Missing authority cannot become customer-visible or alert-eligible; unvalidated/unlicensed batches are rejected. |
| Completed sales drive resale value | `lib/customer-live-payload.js` | Only verified exact-product sold/completed/fulfilled rows count toward resale readiness; active/current asks stay separate and do not authorize sold-value aggregates. |
| Price history identity is exact | `lib/customer-live-payload.js` | History used for customer price claims is isolated by retailer, product, store/location and channel and must predate the current observation. |
| Promotions/rebates do not rewrite price history | `lib/acquisition-cost.js` plus the live payload raw observation | Deferred credit can change economic acquisition cost but not checkout/shelf price or raw retailer history. |
| Ranking is affiliate-neutral | `lib/opportunity-ranking.js` | Affiliate payout/commission/value cannot change the best-opportunity score. |
| Secrets stay out of autonomous publishes | autonomy workflows plus `.github/huntiq-credential-patterns.txt` and pinned TruffleHog | Added lines and the complete candidate working tree are scanned before an agent patch may be published. |

## PM final merge checklist

For an autonomous `ai/issue-*` PR, the PM merge gate is closed unless all of the following are true for the exact current head: `HUNTIQ tests` succeeded; the production `HUNTIQ agent review handoff` verdict is `PASS`; the explicit invariant gate and full `npm test` ran in the autonomous publish path; the PR is same-repository and bound to an allowlisted OWNER `[AI BUILD]` issue/bootstrap packet; the two-repair server-side budget has not been bypassed; no protected trust/invariant file was modified by an agent; secret scans passed; and no unresolved BLOCK finding remains. Agents and autonomous workflows never merge `main`.
