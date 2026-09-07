# Autonomous HUNTIQ trusted-boundary audit snapshot

This file exists so the production reviewer can verify the already-merged trust dependencies that PR #127 relies on without treating their absence from the PR diff as missing evidence. It is an audit snapshot, not executable policy. Runtime policy remains in the workflows/tests themselves, and the autonomous repair workflow fails closed if the pinned production review/test workflow blobs change.

## Snapshot identity

Trusted `main` revision inspected by the HUNTIQ project manager: `4675efe8a9e4b5d20163186e6fa67270d7b296a2`.

Exact already-merged blobs used by the autonomy design:

- `.github/workflows/agent-review.yml`: `99594e96d23d163b3cf75e54b5b8e7be4ec9cf16`
- `scripts/claude-pr-review.py`: `e5b93d7d00f5c7649326118d6ceab4feb3c89678`
- `.github/workflows/test.yml`: `c53d191ea87bb0464a1a8aa840a1b90a94981597`
- `tests/customer-pwa-authority-gate.test.js`: `a830e17f473689c7635a326ad2b7d00217825f8a`
- `tests/resale-integrity.test.js`: `39e61f8497917d2cf846061d106d164c3ae3f648`
- `tests/history-identity.test.js`: `ae58b60928e729d8ce872e36fc6d175ddeaca023`
- `tests/acquisition-cost.test.js`: `50e571823cae12cad6586c5c4224d9c07c2addd9`
- `tests/opportunity-ranking.test.js`: `c767693a979eba42f2f8e4408ac2b3ccb035e1d0`

The five product-invariant tests below use Node's built-in `assert` directly. Their core assertions are not delegated to a mutable custom test helper. They import the real production modules whose behavior they are protecting, so autonomous changes to those modules must continue to satisfy these fixed assertions. The builder also runs the complete `npm test` suite after the explicit invariant gate; the repair loop does the same after every repair.

## Production review handoff already on `main`

The exact pinned `agent-review.yml` uses a `workflow_run` trigger from successful `HUNTIQ tests`, has top-level `contents: read`, resolves the tested PR and exact tested head SHA using GitHub server data, uploads a packet named with that tested SHA, and never checks out PR code in the credential-bearing reviewer job. The Claude job checks out only `scripts/claude-pr-review.py` from the trusted default-branch workflow revision with `persist-credentials: false`; its permissions are `id-token: write` and `contents: read`. The final posting job has only `pull-requests: write`. There is no merge step.

Relevant trusted workflow source, copied from blob `99594e96d23d163b3cf75e54b5b8e7be4ec9cf16` for review visibility:

```yaml
name: HUNTIQ agent review handoff
on:
  workflow_run:
    workflows: ["HUNTIQ tests"]
    types: [completed]

env:
  MAX_AUTOMATED_FIX_ATTEMPTS: '2'

permissions:
  contents: read

jobs:
  prepare-review:
    if: >-
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.event == 'pull_request'
    permissions:
      contents: read
      pull-requests: read
    outputs:
      pr_number: ${{ steps.resolve.outputs.pr_number }}
      head_sha: ${{ github.event.workflow_run.head_sha }}
      run_url: ${{ github.event.workflow_run.html_url }}
    steps:
      - name: Resolve tested PR and exact tested SHA
        env:
          GH_TOKEN: ${{ github.token }}
          REPOSITORY: ${{ github.repository }}
          HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          RUN_URL: ${{ github.event.workflow_run.html_url }}
          PR_NUMBER: ${{ github.event.workflow_run.pull_requests[0].number }}
        run: |
          set -euo pipefail
          mkdir -p .huntiq-review
          {
            echo "repository=$REPOSITORY"
            echo "head_sha=$HEAD_SHA"
            echo "head_branch=$HEAD_BRANCH"
            echo "workflow_run=$RUN_URL"
            echo "pr_number=${PR_NUMBER:-}"
            echo "max_automated_fix_attempts=$MAX_AUTOMATED_FIX_ATTEMPTS"
            echo "auto_merge=false"
          } > .huntiq-review/metadata.txt
          if [[ -n "${PR_NUMBER:-}" ]]; then
            gh pr view "$PR_NUMBER" --repo "$REPOSITORY" --json number,title,url,baseRefName,headRefName,headRefOid,changedFiles,additions,deletions,body > .huntiq-review/pr.json
            gh pr diff "$PR_NUMBER" --repo "$REPOSITORY" > .huntiq-review/pr.diff
          fi

  claude-review:
    needs: prepare-review
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout trusted reviewer only
        uses: actions/checkout@v4
        with:
          ref: ${{ github.sha }}
          persist-credentials: false
          sparse-checkout: |
            scripts/claude-pr-review.py
          sparse-checkout-cone-mode: false
      - name: Download review packet
        uses: actions/download-artifact@v4
        with:
          name: huntiq-review-packet-${{ needs.prepare-review.outputs.head_sha }}
          path: .huntiq-review
      - name: Run Claude review
        run: python3 scripts/claude-pr-review.py .huntiq-review .huntiq-review-result
      - name: Upload sanitized review result
        if: always() && steps.review.outcome == 'success'
        uses: actions/upload-artifact@v4
        with:
          name: huntiq-review-result-${{ needs.prepare-review.outputs.head_sha }}
          path: .huntiq-review-result/
          include-hidden-files: true
          if-no-files-found: error

  post-review:
    needs: [prepare-review, claude-review]
    permissions:
      pull-requests: write
    steps:
      - name: Post comment
        run: |
          gh pr comment "$PR_NUMBER" --repo "$REPOSITORY" --body-file .huntiq-review-result/comment.md
          echo "This workflow never merges anything; auto-merge remains disabled."
```

The trusted reviewer script at blob `e5b93d7d00f5c7649326118d6ceab4feb3c89678` explicitly treats PR metadata/diff as untrusted text and never executes/imports it. It authenticates to Anthropic with GitHub OIDC Workload Identity Federation rather than a static API key, requires a structured `PASS|BLOCK` tool result, converts malformed results to `BLOCK`, and scrubs credential-shaped strings before writing the public comment/artifact. Relevant exact-source excerpts:

```python
SECRET_LIKE_PATTERNS = [
    re.compile(r"sk-ant-[A-Za-z0-9\-_]{10,}"),
    re.compile(r"gho_[A-Za-z0-9]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"Bearer\s+[A-Za-z0-9._~+/\-]{20,}"),
]

if payload.get("verdict") not in ("PASS", "BLOCK"):
    errors.append(f"invalid verdict: {payload.get('verdict')!r}")

if errors:
    payload = {
        "verdict": "BLOCK",
        "summary": "Automated review returned a malformed structured result and could not be trusted.",
        "findings": [{
            "severity": "blocker",
            "file": "general",
            "explanation": "Review response failed schema validation: " + "; ".join(errors),
            "recommended_fix": "Re-run the review. If this persists, treat as a review-pipeline bug, not a PR verdict.",
        }],
    }

comment_body, redacted = scrub_secrets(comment_body)
payload_text, redacted_json = scrub_secrets(json.dumps(payload, indent=2))
```

## Invariant gate 1: customer evidence fails closed

Exact source from `tests/customer-pwa-authority-gate.test.js` blob `a830e17f473689c7635a326ad2b7d00217825f8a`:

```javascript
'use strict';
const assert=require('assert');
const {customerAuthorityDisposition,classifyOpportunityData,partitionCustomerOpportunities}=require('../lib/pwa-data-state');
const asOf='2026-09-05T11:00:00.000Z';
const complete={historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};
const incomplete={...complete,marketComparisonAuthoritative:false,profitRoiAuthoritative:false,notificationAuthoritative:false};
const authorized={id:'authorized',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',evidenceAuthority:complete};
const withheld={id:'withheld',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',referencePrice:999,customerProfit:500,customerRoi:400,comps:{d30:899,d60:875,d90:849},evidenceAuthority:incomplete};
assert.deepEqual(customerAuthorityDisposition(authorized),{present:true,complete:true,missing:[]});
const withheldAuthority=customerAuthorityDisposition(withheld);
assert.equal(withheldAuthority.complete,false);
assert(withheldAuthority.missing.includes('marketComparisonAuthoritative'));
assert(withheldAuthority.missing.includes('profitRoiAuthoritative'));
const authorizedState=classifyOpportunityData(authorized,{asOf});
assert.equal(authorizedState.kind,'live');
assert.equal(authorizedState.customerVisible,true);
assert.equal(authorizedState.alertEligible,true);
const withheldState=classifyOpportunityData(withheld,{asOf});
assert.equal(withheldState.kind,'validation');
assert.equal(withheldState.customerVisible,false);
assert.equal(withheldState.alertEligible,false);
assert(withheldState.reason.startsWith('customer-authority-incomplete:'));
const missingEnvelope={id:'missing-envelope',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-05T10:30:00.000Z',referencePrice:999,customerProfit:500,customerRoi:400,comps:{d30:899,d60:875,d90:849}};
const missingState=classifyOpportunityData(missingEnvelope,{asOf});
assert.equal(missingState.kind,'validation');
assert.equal(missingState.customerVisible,false,'validated live rows without an authority envelope must fail closed');
assert.equal(missingState.alertEligible,false);
assert.equal(missingState.reason,'customer-authority-missing');
const cachedMissing=classifyOpportunityData({...missingEnvelope,id:'cached-missing',dataOrigin:'cached'},{asOf});
assert.equal(cachedMissing.customerVisible,false,'cached customer rows must also carry an authority envelope');
assert.equal(cachedMissing.reason,'customer-authority-missing');
const demo=classifyOpportunityData({id:'demo',dataOrigin:'demo',observedAt:'2026-09-05T10:30:00.000Z'},{asOf});
assert.equal(demo.customerVisible,true,'demo rows remain usable without production authority');
assert.equal(demo.alertEligible,false);
const groups=partitionCustomerOpportunities([authorized,withheld,missingEnvelope],{asOf});
assert.deepEqual(groups.live.map(x=>x.id),['authorized']);
assert.deepEqual(groups.hidden.map(x=>x.id),['withheld','missing-envelope']);
```

This directly invokes the production PWA data-state boundary; the assertions use only Node `assert`.

## Invariant gate 2: completed-sale resale valuation and evidence integrity

Exact source from `tests/resale-integrity.test.js` blob `39e61f8497917d2cf846061d106d164c3ae3f648`:

```javascript
'use strict';
const assert=require('assert');
const Resale=require('../lib/resale-history');
const Gate=require('../lib/evidence-gate');
const asOf='2026-09-01T12:00:00.000Z';
const sold=(price,daysAgo)=>({status:'sold',soldAt:new Date(new Date(asOf).getTime()-daysAgo*86400000).toISOString(),price,shipping:0,matchScore:100,sourceConfidence:100});
const clean=[sold(100,2),sold(102,5),sold(98,8),sold(101,12),sold(99,18),sold(103,24)];
const cleanHistory=Resale.buildResaleHistory(clean,{asOf});
assert.strictEqual(cleanHistory.outlierCount,0);
assert.strictEqual(cleanHistory.priceIntegrity,100);
assert.strictEqual(cleanHistory.marketValue,100.5);
const contaminated=[...clean,sold(799,10)];
const robust=Resale.buildResaleHistory(contaminated,{asOf});
assert.strictEqual(robust.outlierCount,1,'extreme sold price should be filtered');
assert(robust.priceIntegrity<100&&robust.priceIntegrity>=70,'integrity should reflect filtered evidence');
assert(robust.marketValue<110,'extreme comp must not inflate market value');
assert.strictEqual(robust.marketValueBasis,'d30-verified-sold-robust');
const weakGate=Gate.evaluateEvidence({history:{sampleCount:12,spanDays:45,confidence:90},anomaly:{confidence:90},resale:{confidence:90,soldCount90:8,priceIntegrity:60,outlierCount:3},economics:{riskAdjustedRoi:60,riskAdjustedProfit:80,downsideRoi:30,confidenceAdjustedRoi:40},deal:{verified:true,fresh:true}});
assert.strictEqual(weakGate.alertEligible,false);
assert(weakGate.blockers.includes('weak-resale-price-integrity'));
```

This calls the real resale-history builder and evidence gate, not a test-only valuation helper.

## Invariant gate 3: retailer/product/location/channel price-history isolation

Exact source from `tests/history-identity.test.js` blob `ae58b60928e729d8ce872e36fc6d175ddeaca023`:

```javascript
const assert=require('assert');
const history=require('../lib/history-query');
const baseline=require('../lib/baseline');
const now=Date.UTC(2026,7,31,4,0,0);
const base={retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',verified:true,sourceFamily:'public'};
const rows=[
 {...base,price:199,condition:'new',priceScope:'public',observedAt:new Date(now-10*864e5).toISOString()},
 {...base,price:205,condition:'new',priceScope:'public',observedAt:new Date(now-7*864e5).toISOString()},
 {...base,price:49,condition:'open box',priceScope:'public',observedAt:new Date(now-6*864e5).toISOString()},
 {...base,price:149,condition:'new',priceScope:'member',observedAt:new Date(now-5*864e5).toISOString()},
 {...base,price:201,condition:'new',priceScope:'public',observedAt:new Date(now-2*864e5).toISOString()}
];
const publicNew=history.windowObservations(rows,{retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',condition:'new',priceScope:'public'},{now,days:30});
assert.strictEqual(publicNew.length,3,'open-box and member observations must not contaminate public new history');
assert(publicNew.every(r=>history.conditionOf(r)==='new'&&history.priceScopeOf(r)==='public'));
const b=baseline.robustBaseline(rows,{retailer:'Harbor Freight',sku:'SKU1',storeId:'PA1',channel:'store',condition:'new',priceScope:'public'},{now,minSpacingHours:0});
assert(b.median>=199&&b.median<=205,'baseline median must reflect only comparable public-new observations');
const a=baseline.scorePriceAnomaly(99,b);
assert(a.dropPct>50,'isolated baseline should preserve a genuine markdown signal');
```

The production query/baseline APIs receive retailer, SKU, store, channel, condition, and price-scope identity explicitly.

## Invariant gates 4 and 5: promotion eligibility and rebate separation

Exact source from `tests/acquisition-cost.test.js` blob `50e571823cae12cad6586c5c4224d9c07c2addd9`:

```javascript
const assert=require('assert');
const A=require('../lib/acquisition-cost.js');
const C=require('../lib/channel-economics.js');
const plain=A.evaluateAcquisition({price:100,taxRate:.06});
assert.strictEqual(plain.checkoutPrice,100);
assert.strictEqual(plain.cashOutlay,106);
assert.strictEqual(plain.expectedFutureCredit,0);
assert.strictEqual(plain.economicAcquisitionCost,106);
const rebate=A.evaluateAcquisition({price:100,taxRate:.06,acquisition:{futureCredit:11,futureCreditType:'rebate-credit',realizationRate:1,daysToCredit:0,annualDiscountRate:0}});
assert.strictEqual(rebate.checkoutPrice,100,'future rebate must not reduce checkout price');
assert.strictEqual(rebate.cashOutlay,106,'future rebate must not reduce cash paid today');
assert.strictEqual(rebate.expectedFutureCredit,11);
assert.strictEqual(rebate.economicAcquisitionCost,95);
const unknownMemberPromo=A.evaluateAcquisition({price:60,observedAt:'2026-09-01T12:00:00Z',acquisition:{instantDiscount:12,promotion:{membershipRequired:true,minimumSpend:50}}});
assert.strictEqual(unknownMemberPromo.promotionStatus,'unknown');
assert.strictEqual(unknownMemberPromo.checkoutPrice,60,'unconfirmed member pricing must not inflate ROI');
const expiredPromo=A.evaluateAcquisition({price:60,observedAt:'2026-09-03T12:00:00Z',acquisition:{instantDiscount:12,futureCredit:10,promotion:{expiresAt:'2026-09-02T12:00:00Z'}}});
assert.strictEqual(expiredPromo.promotionStatus,'ineligible');
assert.strictEqual(expiredPromo.checkoutPrice,60);
assert.strictEqual(expiredPromo.expectedFutureCredit,0,'expired future rewards must also be excluded');
const channel=C.evaluateChannel({price:100,taxRate:.06,acquisition:{futureCredit:11,futureCreditType:'rebate-credit',realizationRate:1,daysToCredit:0,annualDiscountRate:0},resale:{marketValue:150,resaleConfidence:90}},{name:'Test market',salePrice:150,feeRate:0,confidence:90});
assert.strictEqual(channel.cashAcquisitionOutlay,106);
assert.strictEqual(channel.expectedFutureCredit,11);
assert.strictEqual(channel.capitalOutlay,106);
assert.strictEqual(channel.profit,55,'profit may include expected rebate value without pretending checkout was cheaper');
assert.strictEqual(channel.roi,51.9,'cash ROI denominator should remain actual capital paid');
```

These assertions call the real acquisition-cost and channel-economics modules and distinguish cash checkout from deferred economic value.

## Invariant gate 6: affiliate-neutral ranking

Exact source from `tests/opportunity-ranking.test.js` blob `c767693a979eba42f2f8e4408ac2b3ccb035e1d0`:

```javascript
const assert=require('assert');
const Ranking=require('../lib/opportunity-ranking');
const strong={id:'strong',profit:70,roi:55,confidence:88,anomaly:{dropPct:35},resale:{liquidityScore:82,estimatedDaysToSell:12},downsideEconomics:{roi:28},capitalEfficiency:{score:80},executionConfidence:{score:90},evidenceAgreement:{score:92},opportunityHalfLife:{evidenceStrengthRemainingPct:94}};
const affiliateInflated={...strong,id:'affiliate',affiliateCommission:9999,affiliatePayout:9999};
assert.strictEqual(Ranking.bestOpportunityScore(affiliateInflated),Ranking.bestOpportunityScore(strong),'affiliate economics must not affect deal ranking');
```

This calls the real ranking module directly; there is no custom assertion helper that an autonomous implementation can weaken.

## Secret hygiene is an executable workflow gate, not an invariant test helper

The autonomy workflows independently extract only added diff lines and fail if credential-like material is introduced. This is intentionally separate from the five product-behavior tests because it is a repository/worktree boundary check, not application behavior. The repair workflow runs the same scan after Claude edits and before any commit/push. The builder also protects `.github/workflows/**`, the five invariant tests, and the attempt-ledger verifier/test from autonomous modification before and after Claude runs.

## Why indirect weakening does not bypass these tests

The protected test files do not import a mutable HUNTIQ assertion utility. They import Node `assert` plus the production modules under test. An autonomous change may legitimately edit a production module to implement a feature, but it cannot make a customer row fail open, blend history identities, treat an unconfirmed promotion as checkout savings, let deferred rebates masquerade as cash savings, or let affiliate payout change ranking without causing the fixed direct assertions above to fail. After the explicit gate, the workflow runs the complete `npm test` suite as an additional integration regression layer.

This audit snapshot should be updated only by the PM if one of the pinned trusted blobs changes. A changed trusted review/test producer already causes the bounded repair workflow to fail closed until its expected blob is deliberately re-pinned.