const assert=require('assert');
const quality=require('../lib/comp-quality');
const bridge=require('../lib/marketplace-alert-bridge');

const retail={title:'Sony WH-1000XM6 Wireless Headphones',brand:'Sony',model:'WH1000XM6',upc:'027242930292'};
const sold=(price,extra={})=>({title:retail.title,brand:retail.brand,model:retail.model,upc:retail.upc,price,evidenceType:'verified sold',...extra});
const now=Date.parse('2026-09-04T22:00:00Z');
const undated=quality.assess(retail,[sold(399),sold(405),sold(389),sold(410)],{now});
assert.equal(undated.datedSoldCount,0);
assert.equal(undated.freshnessKnown,false,'sold depth without timestamps must not create freshness authority');
assert.equal(undated.freshnessScore,0,'undated sold evidence must carry zero freshness score');
const undatedEconomics=quality.adjustEconomics({profit:100,roi:50},undated);
assert.equal(undatedEconomics.compFreshnessKnown,false);
assert.equal(undatedEconomics.compFreshness,0);

const dated=quality.assess(retail,[sold(399,{soldAt:'2026-09-03T12:00:00Z'}),sold(405,{soldAt:'2026-09-02T12:00:00Z'}),sold(389,{soldAt:'2026-09-01T12:00:00Z'}),sold(410,{soldAt:'2026-08-31T12:00:00Z'})],{now});
assert.equal(dated.freshnessKnown,true);
assert(dated.freshnessScore>90,'recent dated sold evidence should retain strong freshness authority');
assert.equal(dated.datedSoldCount,4);

const permissive={minFlipScore:0,minProfit:0,minRoi:0,minRiskAdjustedProfit:0,minRiskAdjustedRoi:0,minConfidenceAdjustedProfit:0,minConfidenceAdjustedRoi:0,minLiquidationProfit:0,minLiquidationRoi:0,minPriceStabilityScore:0,minDownsideSafetyMarginPct:0,minPurchaseHeadroomPct:0,minAnomalyConfidence:0,minHistoryBaselineConfidence:0,minEvidenceQuality:0,minConfirmationScore:0,maxObservationAgeHours:99999,now};
const base={id:'undated-comp-1',price:50,marketValue:150,flipScore:100,evidenceQuality:1,observedAt:'2026-09-04T21:00:00Z',anomaly:{confidence:95},resale:{marketValue:150,resaleConfidence:95},economics:{profit:80,roi:100},riskAdjustedEconomics:{profit:75,roi:90},downsideEconomics:{profit:60,roi:70,safetyMarginPct:50},historyAssessment:{freshnessScore:90,historyStale:false,label:'strong-markdown'}};
const blocked=bridge.shouldAlert({...base,compQuality:undated},permissive);
assert.equal(blocked.resaleFreshnessScore,0);
assert.equal(blocked.temporalEvidence.resaleFreshnessKnown,false);
assert.equal(blocked.temporalEvidence.resaleFreshnessSource,'undated-sold-comps');
assert.equal(blocked.temporalEvidenceComplete,false);
assert.equal(blocked.temporalTrustScore,0);
assert.equal(blocked.alert,false,'undated sold comps must not authorize an urgent customer alert');
assert(blocked.reasons.includes('undated-resale-comp-freshness'));
assert(blocked.priority<=19);
assert.equal(blocked.marketplaceEconomics.evidenceAdjustedProfit,0);
assert.equal(blocked.marketplaceEconomics.evidenceAdjustedRoiPct,0);

const eligible=bridge.shouldAlert({...base,compQuality:dated},permissive);
assert.equal(eligible.temporalEvidence.resaleFreshnessKnown,true);
assert.equal(eligible.temporalEvidence.resaleFreshnessSource,'dated-sold-comps');
assert(eligible.temporalTrustScore>0);
console.log('resale freshness provenance tests passed',{undated:blocked.temporalEvidence,dated:eligible.temporalEvidence});
