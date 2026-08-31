const assert=require('assert');
const alerts=require('../lib/alert-outcome');
function deal(resale){return{retailer:'Demo',sku:'x1',price:100,flipScore:92,evidenceQuality:.95,anomaly:{confidence:90,label:'extreme'},priceBaseline:{confidence:90},economics:{profit:180,roi:120,totalInvested:150},riskAdjustedEconomics:{profit:150,roi:95},downsideEconomics:{roi:80,safetyMarginPct:45},risk:{priceStability:{stabilityScore:90},liquidation:{economics:{profit:-20,roi:-10}}},purchaseDecision:{headroomPct:30},confirmation:{score:90},resale:{liquidityScore:85,resaleConfidence:90,...resale},observedAt:new Date().toISOString(),fulfillment:{status:'available',confidence:95}};}
const healthy=alerts.shouldAlert(deal({sold7:8,sold30:30,sold90:75,activeCount:2}));
assert(!healthy.reasons.includes('sell-through'),'healthy resale demand should pass sell-through gate');
assert(!healthy.reasons.includes('capital-lockup'),'healthy resale demand should not lock capital too long');
const thin=alerts.shouldAlert(deal({sold7:0,sold30:2,sold90:10,activeCount:24,resaleConfidence:55}));
assert(thin.reasons.includes('sell-through'),'thin crowded market should fail sell-through gate');
assert(thin.reasons.includes('capital-lockup'),'slow resale should fail capital lockup gate');
assert.strictEqual(thin.alert,false);
const slowButPositive=alerts.shouldAlert(deal({sold7:0,sold30:4,sold90:15,activeCount:10,resaleConfidence:85}),{minSellThroughPct:0,minSellThroughExpectedProfit:-100,minSellThroughExpectedRoi:-100});
assert(slowButPositive.reasons.includes('capital-lockup')||slowButPositive.reasons.includes('capital-velocity'),'positive headline economics should still be blocked when capital velocity is poor');
const a=alerts.shouldNotify(deal({sold7:0,sold30:2,activeCount:24,resaleConfidence:55}),null);
const b=alerts.shouldNotify(deal({sold7:7,sold30:20,activeCount:3,resaleConfidence:90}),null);
assert.notStrictEqual(a.decision.resaleOutcome.status,b.decision.resaleOutcome.status);
assert(b.decision.resaleOutcome.capitalVelocityScore>a.decision.resaleOutcome.capitalVelocityScore);
console.log('alert outcome tests passed',{healthy:healthy.resaleOutcome,thin:thin.resaleOutcome});