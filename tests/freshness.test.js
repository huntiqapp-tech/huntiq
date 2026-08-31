const assert=require('assert');
const F=require('../lib/freshness');
const A=require('../lib/alert-stress');
const now=new Date('2026-08-30T20:00:00Z').getTime();
function opportunity(observedAt){return{retailer:'Micro Center',sku:'GPU-1',storeId:'NJ',price:100,observedAt,flipScore:94,evidenceQuality:.95,anomaly:{confidence:95,label:'Extreme Deal'},priceBaseline:{confidence:90},economics:{profit:150,roi:100},downsideEconomics:{profit:100,roi:70,safetyMarginPct:35},riskAdjustedEconomics:{profit:90,roi:65},purchaseDecision:{headroomPct:35},risk:{priceStability:{stabilityScore:90},liquidation:{economics:{profit:70,roi:50}}},resale:{marketValue:320,conservativeValue:300,askingMedian:315,resaleConfidence:92,competitionRatio:.2,momentumPct:2,spreadPct:6,estimatedDaysToSell:6,liquidityScore:90},feeRate:.13,shipping:10,taxRate:.06,holdingCostPerDay:.1};}
const fresh=F.assess(opportunity('2026-08-30T19:45:00Z'),{now});assert.equal(fresh.status,'fresh');assert.equal(fresh.confidence,100);
const aging=F.assess(opportunity('2026-08-28T20:00:00Z'),{now});assert.equal(aging.status,'aging');assert(aging.confidence<100&&aging.confidence>45);
const future=F.assess(opportunity('2026-08-30T21:00:00Z'),{now});assert.equal(future.status,'future');assert.equal(future.confidence,0);
const stale=F.assess(opportunity('2026-08-26T20:00:00Z'),{now});assert.equal(stale.status,'stale');assert.equal(stale.confidence,0);
const freshDecision=A.shouldAlert(opportunity('2026-08-30T19:45:00Z'),{now});assert.equal(freshDecision.alert,true);assert(freshDecision.freshnessAdjustedEconomics.profit>50);
const agingDecision=A.shouldAlert(opportunity('2026-08-28T20:00:00Z'),{now});assert(agingDecision.freshnessAdjustedEconomics.profit<freshDecision.freshnessAdjustedEconomics.profit,'aging observations must haircut trusted profit');assert(agingDecision.priority<freshDecision.priority,'aging observations must rank below fresh observations');
const futureDecision=A.shouldAlert(opportunity('2026-08-30T21:00:00Z'),{now});assert.equal(futureDecision.alert,false);assert(futureDecision.reasons.includes('future-observation'),'future timestamps must never look fresh');
const staleDecision=A.shouldAlert(opportunity('2026-08-26T20:00:00Z'),{now});assert.equal(staleDecision.alert,false);assert(staleDecision.reasons.includes('stale-observation'));assert(staleDecision.reasons.includes('observation-freshness'));
const fpFresh=F.fingerprint(opportunity('2026-08-30T19:45:00Z'),{now});const fpAging=F.fingerprint(opportunity('2026-08-29T20:00:00Z'),{now});assert.notEqual(fpFresh,fpAging,'material freshness decay must change alert state');
console.log('freshness tests passed',{fresh:fresh.confidence,aging:aging.confidence});