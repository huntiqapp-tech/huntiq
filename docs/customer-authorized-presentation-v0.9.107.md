# Customer-authorized presentation boundary — v0.9.107

HUNTIQ now converts the v0.9.106 evidence-authority summary into a fail-closed customer presentation instead of exposing unauthorized values alongside warning flags.

## Presentation rules

- An anomaly reference price is presented only when anomaly evidence is authoritative; otherwise the reference price is `null` and customer anomaly confidence is zero.
- Completed-sale aggregate values (`d30`, `d60`, `d90`, sold-window length) are presented only when market-comparison evidence is authoritative. Active listing counts and current asks may remain visible as non-authoritative context.
- Customer profit and ROI are presented only when the combined history + market + economics authority chain is satisfied. Otherwise the explicit customer fields are `null` and legacy readiness economics are zeroed in the customer projection.
- Customer alert eligibility and alert action are suppressed unless notification authority is satisfied.
- The underlying verified history rows and completed sales remain available for evidence inspection; this layer only prevents unsupported derived claims from being presented as authoritative outputs.

## Database audit

`db/082_customer_authorized_presentation_integrity.sql` records what was actually presented and enforces that unauthorized anomaly, market, economics, or alert states cannot coexist with customer-visible derived values.

## PWA

The service worker now caches `lib/customer-live-authority.js` and advances to `huntiq-public-v107`, so the customer authorization/redaction boundary can be shipped with the PWA rather than existing only on the server/test path.
