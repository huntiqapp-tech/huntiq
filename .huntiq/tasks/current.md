status: pending
issue: 149
bootstrap_run: 34161278110
bootstrap_author_association: OWNER
bootstrap_title_sha256: 923412c35a9f3f291dde11d9a29634ff454f91f95e9296cd97842dcb7293a31b
title: [AI BUILD] Rights-cleared completed-sale feed into real-market resale evidence

## Task
## Goal
Close the largest remaining evidence gap in HUNTIQ launch readiness: feed legitimate completed-sale records into the existing resale/evaluator/customer-authority path without ever substituting active listings, asking prices, MSRP, list price, or retailer reference discounts for sold-market evidence.

## Why this is next
`PROJECT_STATUS.md` says the public PWA still depends on demo data until rights-cleared live integrations are connected and explicitly calls out: "Connect a legitimate completed-sale provider before claiming live 30/60/90 sold history." Retailer/live-ingestion and customer-PWA work are already active in separate PRs, so do not duplicate those workstreams.

## Scope
Build the provider-neutral, server-only completed-sale ingestion boundary that a legitimate licensed/API source can plug into immediately. Use fixture-driven provider responses for CI; no credentials are required or permitted in source.

### Required behavior
- Add a canonical completed-sale observation contract with product identity, marketplace/source, sold timestamp, sold price, currency, condition, quantity where available, source URL/id, observed/fetched timestamp, rights class, redistribution permission, and provenance.
- Fail closed on active/unsold/cancelled/ended-without-sale rows, missing sold timestamp, zero/negative price, future timestamps, stale/ambiguous identity, missing provenance, or insufficient rights.
- Keep asking/active listing evidence available only as non-authoritative context if already supported; it must never enter completed-sale valuation aggregates.
- Normalize provider records into the existing `lib/resale-history.js` / real-market-value path rather than creating a parallel valuation model.
- Preserve 30/60/90 sold windows and existing freshness/source-quality handling.
- Add a server-only adapter interface and a sanitized smoke command that requires runtime configuration and prints no credential, request header, raw secret-bearing response, or browser-facing token.
- Keep alerts disabled unless the existing customer-authority/live-readiness gates independently authorize the resulting opportunity.
- Do not change ranking weights, scoring formulas, alert thresholds, price-history identity, acquisition/promotion semantics, or affiliate behavior.

## Integration proof required
Add regression/integration coverage that drives provider fixture -> completed-sale normalization -> existing resale aggregation -> customer live payload/authority boundary. Tests must prove:
1. only true completed sales affect resale market value;
2. active asking prices cannot contaminate sold value even when much higher;
3. 30/60/90 window membership uses sold timestamps;
4. product/condition mismatches fail closed;
5. missing/insufficient rights cannot become customer resale authority;
6. the $69 acquisition / roughly $60 completed-sale market-value case remains SKIP regardless of a high MSRP;
7. no secrets can enter output payloads/log summaries.

## Coordination / non-duplication
- Do not duplicate PR #137 live retailer ingestion, PR #138 customer PWA/feed work, PR #143 Home Depot shadow scraping, or older authority-gate work in #121/#126.
- Rebase/integrate against current `main`; use existing contracts/helpers where possible.
- If an active PR already establishes a compatible customer-feed boundary, adapt to it rather than replacing it.

## Definition of done
HUNTIQ has a tested, fail-closed completed-sale ingestion boundary that can accept a legitimate provider at runtime, uses only verified sold evidence for real-market value, feeds the existing customer authority path, and cannot expose or alert on unverified/unauthorized resale evidence. Full invariant gate and `npm test` pass. No secrets. No auto-merge.

## Guardrails
- Never merge main.
- Never add, expose, or rotate credentials.
- Do not weaken customer evidence authority, resale-comps integrity, price-history isolation, promotion/rebate handling, or affiliate-neutral ranking.
- Run the explicit HUNTIQ invariant gate and the full test suite before declaring implementation complete.
