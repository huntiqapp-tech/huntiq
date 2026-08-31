const assert=require('assert');
const alerts=require('../lib/alert-outcome');
function deal(resale){return{retailer:'Demo',sku:'x1',price:100,flipScore:92,evidenceQuality:.95,anomaly:{confidence:90,label:'extreme'},priceBaseline:{confidence:90},economics:{profit:180,roi:120},riskAdjustedEconomics:{profit:150,roi:95},downsideEconomics:{roi:80,safetyMarginPct:45},risk:{priceStability:{stabilityScore:90},liquidation:{economics:{profit:-20,roi:-10}}},purchaseDecision:{headroomPct:30},confirmation:{score:90},resale:{liquidityScore:85,resaleConfidence:90,...resale},observedAt:new Date().toISOString(),fulfillment:{status:'available',confidence:95}};}
const healthy=alerts.shouldAlert(deal({sold30:30,activeCount:2}));
assert(!healthy.reasons.includes('sell-through'),'healthy resale demand should pass sell-through gate');
const thin=alerts.shouldAlert(deal({sold30:2,activeCount:24,resaleConfidence:55}));
assert(thin.reasons.includes('sell-through'),'thin crowded market should fail sell-through gate');
assert.strictEqual(thin.alert,false);
const a=alerts.shouldNotify(deal({sold30:2,activeCount:24,resaleConfidence:55}),null);
const b=alerts.shouldNotify(deal({sold30:20,activeCount:3,resaleConfidence:90}),null);
assert.notStrictEqual(a.decision.resaleOutcome.status,b.decision.resaleOutcome.status);
console.log('alert outcome tests passed');