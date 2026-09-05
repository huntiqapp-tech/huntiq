# Customer evidence authority boundary — v0.9.106

HUNTIQ now has an explicit customer-facing authority summary layered on top of the existing validated live payload and live-readiness gates. This does not retune anomaly, resale, economics, confidence, ranking or alert models.

## Entry points

- `lib/customer-evidence-authority.js` computes independent authority flags from already-sanitized customer evidence and the existing readiness result.
- `lib/customer-live-authority.js` wraps `buildCustomerLivePayload(...)` and attaches `evidenceAuthority` to every accepted live opportunity.

## Authority chain

1. `historyAuthoritative` requires the existing history-ready result and at least three individually verified history rows.
2. `anomalyAuthoritative` additionally requires an exposed finite reference price and nonzero anomaly confidence.
3. `marketComparisonAuthoritative` requires the existing resale-ready result, at least three individually verified completed sales, and an authoritative aggregate comp object.
4. `profitRoiAuthoritative` requires provider release readiness, existing economics readiness, authoritative history, authoritative market comparison, and positive conservative profit/ROI.
5. `notificationAuthoritative` additionally requires explicit alert enablement, existing alert eligibility and customer data state `live`.

The summary carries deterministic blockers so the PWA can explain why a value or notification is withheld without inferring authority from the mere presence of a number.

## Audit storage

`db/081_customer_live_authority_summary.sql` persists the five authority flags and verified evidence counts. Database constraints prevent a downstream snapshot from claiming anomaly authority without history authority, market authority without three verified completed sales, profit/ROI authority without both history and market authority, or notification authority without positive economics authority in a live state.

## Follow-up

When authenticated provider adapters are upgraded to expose child-record provenance consistently, route the production customer endpoint through `buildCustomerAuthorizedLivePayload(...)` and render its blocker reasons in the PWA. Do not remove or bypass the existing readiness gates.
