const assert=require('assert');
const Alerts=require('../lib/alerts');
const History=require('../lib/history');

const base={retailer:'Home Depot',sku:'X',storeId:'1',price:100,flipScore:90,evidenceQuality:1,observedAt:new Date().toISOString(),anomaly:{confidence:90,label:'Extreme Deal'},economics:{profit:150,roi:100},downsideEconomics:{profit:100,roi:60,safetyMarginPct:30},riskAdjustedEconomics:{profit:100,roi:70},resale:{liquidityScore:80},capitalEfficiency:{score:75},risk:{priceStability:{stabilityScore:90},stabilityAdjustedAnomalyConfidence:90,liquidation:{economics:{profit:80,roi:50}}},purchaseDecision:{headroomPct:25}};
assert.strictEqual(Alerts.shouldAlert(base).alert,true,'healthy safe-buy headroom should remain alert eligible');
const thin={...base,purchaseDecision:{headroomPct:2}};
const thinDecision=Alerts.shouldAlert(thin);
assert.strictEqual(thinDecision.alert,false,'thin purchase headroom should block alert');
assert(thinDecision.reasons.includes('purchase-headroom'));
assert.notStrictEqual(Alerts.alertFingerprint(base),Alerts.alertFingerprint({...base,purchaseDecision:{headroomPct:45}}),'headroom bucket changes should alter fingerprint');

const start=Date.parse('2026-01-01T00:00:00Z');
const rows=Array.from({length:12},(_,i)=>({retailer:'Home Depot',sku:'SKU',storeId:'1',price:i===7?80:100,inventory:i<9?5:4,verified:true,sourceFamily:'retailer',observedAt:new Date(start+i*3600e3).toISOString()}));
const compact=History.compactObservations(rows,{keepRecent:2,minIntervalHours:6});
assert(compact.length<rows.length,'stable hourly observations should compact');
assert(compact.some(r=>r.price===80),'price-change observation must be preserved');
assert(compact.some(r=>r.inventory===4),'inventory-change observation must be preserved');
assert.strictEqual(compact[compact.length-1].observedAt,rows[rows.length-1].observedAt,'latest observation must be preserved');
console.log('decision alert/history compaction tests passed');
