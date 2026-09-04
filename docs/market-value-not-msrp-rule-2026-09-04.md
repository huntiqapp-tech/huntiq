# HUNTIQ market-value rule: never treat MSRP as resale value

Established: 2026-09-04

## Product rule
HUNTIQ must never classify an opportunity as BUY, WATCH, SKIP, profitable, or high-ROI because a retailer's MSRP, list price, regular price, compare-at price, strike-through price, or similar reference price is high.

A reference price can be displayed as retailer context only. It cannot supply or raise resale market value, expected sale price, profit, ROI, downside economics, decision-floor economics, Deal Coach recommendation, opportunity ranking, or alert eligibility.

## Authoritative resale basis
For reseller economics, current market value must come from rights-cleared, product-matched completed-sale evidence. Active listings and asking prices are not sold comps. When adequate completed-sale evidence is unavailable, HUNTIQ must reduce confidence or withhold the recommendation rather than substitute MSRP.

## Regression scenario
A product costs $69 at the retailer, the retailer claims MSRP/list price of $160, and comparable completed sales cluster near $60. HUNTIQ must not call that a deal. The expected economics should remain unprofitable/negative after marketplace costs, and the recommendation should remain SKIP regardless of the $160 reference price.

`tests/opportunity-evaluator.test.js` contains a regression test that evaluates the same opportunity with and without inflated MSRP/list-price fields and requires identical resale value, profit/ROI economics, and recommendation.

## Why this matters
This prevents false arbitrage: a large percentage-off-MSRP badge can look attractive even when the product's real secondary-market value is already at or below the acquisition price. HUNTIQ's trust advantage depends on judging the price users can realistically sell at today, not a manufacturer's reference price.
