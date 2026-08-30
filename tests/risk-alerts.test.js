const assert=require('assert');
const A=require('../lib/alerts.js');

function base(){return{retailer:'Home Depot',sku:'X',storeId:'1',price:20,flipScore:90,evidenceQuality:.95,confirmation:{score:90},anomaly:{confidence:92,label:'Probable Error'},economics:{profit:150,roi:180},downsideEconomics:{profit:100,roi:100,safetyMarginPct:55},riskAdjustedEconomics:{profit:110,roi:120},resale:{liquidityScore:80},capitalEfficiency:{score:85},risk:{stabilityAdjustedAnomalyConfidence:88,priceStability:{stabilityScore:90},liquidation:{economics:{profit:75,roi:65}}}};}
const good=base();assert.strictEqual(A.shouldAlert(good).alert,true);
const volatile=base();volatile.risk.priceStability.stabilityScore=30;volatile.risk.stabilityAdjustedAnomalyConfidence=58;const vd=A.shouldAlert(volatile);assert.strictEqual(vd.alert,false);assert(vd.reasons.includes('price-volatility'));assert(vd.reasons.includes('anomaly-confidence'));
const weakLiquidation=base();weakLiquidation.risk.liquidation.economics={profit:8,roi:10};const ld=A.shouldAlert(weakLiquidation);assert.strictEqual(ld.alert,false);assert(ld.reasons.includes('liquidation-profit'));assert(ld.reasons.includes('liquidation-roi'));
assert(A.effectiveAnomalyConfidence(good)===88);
const fp1=A.alertFingerprint(good);const changed=base();changed.risk.liquidation.economics.roi=12;assert.notStrictEqual(fp1,A.alertFingerprint(changed));
console.log('HUNTIQ risk alert tests passed',{priority:A.alertPriority(good),fingerprint:fp1});