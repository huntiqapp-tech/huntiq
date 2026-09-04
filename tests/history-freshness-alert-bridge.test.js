const assert=require('assert');
const bridge=require('../lib/marketplace-alert-bridge');

const permissive={minFlipScore:0,minProfit:0,minRoi:0,minRiskAdjustedProfit:0,minRiskAdjustedRoi:0,minConfidenceAdjustedProfit:0,minConfidenceAdjustedRoi:0,minLiquidationProfit:0,minLiquidationRoi:0,minPriceStabilityScore:0,minDownsideSafetyMarginPct:0,minPurchaseHeadroomPct:0,minAnomalyConfidence:0,minHistoryBaselineConfidence:0,minEvidenceQuality:0,minConfirmationScore:0,maxObservationAgeHours:99999,now:Date.parse('2026-09-04T22:00:00Z')};
const base={id:'temporal-1',price:50,marketValue:150,flipScore:100,evidenceQuality:1,observedAt:'2026-09-04T21:00:00Z',anomaly:{confidence:95},resale:{marketValue:150,resaleConfidence:95,compFreshnessScore:90},economics:{profit:80,roi:100},riskAdjustedEconomics:{profit:75,roi:90},downsideEconomics:{profit:60,roi:70,safetyMarginPct:50},historyAssessment:{freshnessScore:90,historyStale:false,label:'strong-markdown'}};

const fresh=bridge.shouldAlert(base,permissive);
assert.equal(fresh.alert,true,'fresh retail history and resale comps should remain alert eligible under permissive economics');
assert.equal(fresh.historyFreshnessScore,90);assert.equal(fresh.resaleFreshnessScore,90);assert.equal(fresh.temporalTrustScore,90);assert.equal(fresh.temporalEvidenceComplete,true);assert.equal(fresh.anomalyConfidence,90,'PWA anomaly authority must not exceed current history freshness authority');

const staleHistory=bridge.shouldAlert({...base,historyAssessment:{freshnessScore:20,historyStale:true,label:'stale-history'}},permissive);
assert.equal(staleHistory.alert,false,'stale price history must hard-stop the customer alert even when headline profit is large');
assert(staleHistory.reasons.includes('stale-price-history'));assert(staleHistory.priority<=29);assert.equal(staleHistory.marketplaceAlertState,'digest');assert.equal(staleHistory.anomalyConfidence,20);
assert(staleHistory.marketplaceEconomics.evidenceAdjustedProfit<fresh.marketplaceEconomics.evidenceAdjustedProfit,'temporal evidence decay must flow into customer-facing profit authority');

const staleResale=bridge.shouldAlert({...base,resale:{...base.resale,compFreshnessScore:30}},permissive);
assert.equal(staleResale.alert,false,'stale completed-sale comparison evidence must not preserve an urgent PWA flip');
assert(staleResale.reasons.includes('stale-resale-comps'));assert(staleResale.priority<=29);

const missingHistory=bridge.shouldAlert({...base,historyAssessment:undefined},permissive);
assert.equal(missingHistory.historyFreshnessScore,0,'unknown price-history freshness must never default to perfect freshness');
assert.equal(missingHistory.temporalEvidence.historyFreshnessKnown,false);assert.equal(missingHistory.temporalEvidenceComplete,false);assert.equal(missingHistory.temporalTrustScore,0);assert.equal(missingHistory.alert,false);assert(missingHistory.reasons.includes('missing-price-history-freshness'));assert(missingHistory.priority<=19);assert.equal(missingHistory.anomalyConfidence,0);
assert.equal(missingHistory.marketplaceEconomics.evidenceAdjustedProfit,0,'unknown temporal evidence must remove profit authority at the customer boundary');assert.equal(missingHistory.marketplaceEconomics.evidenceAdjustedRoiPct,0,'unknown temporal evidence must remove ROI authority at the customer boundary');

const missingResale=bridge.shouldAlert({...base,resale:{marketValue:150,resaleConfidence:95}},permissive);
assert.equal(missingResale.resaleFreshnessScore,0,'unknown completed-sale freshness must never default to perfect freshness');
assert.equal(missingResale.temporalEvidence.resaleFreshnessKnown,false);assert.equal(missingResale.temporalTrustScore,0);assert.equal(missingResale.alert,false);assert(missingResale.reasons.includes('missing-resale-comp-freshness'));assert(missingResale.priority<=19);
assert.equal(missingResale.marketplaceEconomics.evidenceAdjustedProfit,0);assert.equal(missingResale.marketplaceEconomics.evidenceAdjustedRoiPct,0);

const baselineFraction={...base,historyAssessment:undefined,priceBaseline:{freshnessScore:.6,confidence:80}};
assert.equal(bridge.historyFreshnessScore(baselineFraction),60,'robust-baseline fractional freshness must normalize to the PWA 0-100 scale');
console.log('history freshness alert bridge tests passed',{fresh:fresh.temporalEvidence,staleHistory:staleHistory.temporalEvidence,staleResale:staleResale.temporalEvidence,missingHistory:missingHistory.temporalEvidence,missingResale:missingResale.temporalEvidence});
