const assert=require('assert');
const gate=require('../lib/consensus-alerts');
function strong(){return{retailer:'Test',sku:'1',price:40,flipScore:90,evidenceQuality:1,anomaly:{confidence:90,label:'Extreme Deal'},economics:{profit:100,roi:120},downsideEconomics:{safetyMarginPct:40},resale:{resaleConfidence:90},observedAt:'2026-08-31T10:00:00Z'};}
{
 const o=strong();o.priceConsensus={confidence:92,sourceCount:3,conflicting:false};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,true);assert(!d.reasons.includes('price-consensus'));
}
{
 const o=strong();o.priceConsensus={confidence:40,sourceCount:2,conflicting:false};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,false);assert(d.reasons.includes('price-consensus'));
}
{
 const o=strong();o.priceConsensus={confidence:80,sourceCount:2,conflicting:true};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,false);assert(d.reasons.includes('price-conflict'));assert(gate.alertPriority(o)<100);
}
console.log('consensus-alert tests passed');