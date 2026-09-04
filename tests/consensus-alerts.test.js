const assert=require('assert');
const gate=require('../lib/consensus-alerts');
function strong(){return{retailer:'Test',sku:'1',price:40,flipScore:90,evidenceQuality:1,anomaly:{confidence:90,label:'Extreme Deal'},economics:{profit:100,roi:120},downsideEconomics:{safetyMarginPct:40},resale:{resaleConfidence:90},marketReality:{verdict:'below-sold-market',acquisitionPrice:40,soldMarketValue:100,marketSpread:60},observedAt:'2026-08-31T10:00:00Z'};}
{
 const o=strong();o.priceConsensus={confidence:92,sourceCount:3,conflicting:false};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,true);assert(!d.reasons.includes('price-consensus'));assert.equal(d.marketReality.verdict,'below-sold-market');
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
{
 const o=strong();o.priceConsensus={confidence:95,sourceCount:3,conflicting:false};o.marketReality={verdict:'above-sold-market',acquisitionPrice:69,soldMarketValue:60,marketSpread:-9,referencePrice:160};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,false);assert(d.reasons.includes('no-sold-market-edge'));assert(gate.fingerprint(o).includes('above-sold-market'));
}
{
 const o=strong();o.priceConsensus={confidence:95,sourceCount:3,conflicting:false};o.marketReality={verdict:'sold-market-unknown',acquisitionPrice:20,soldMarketValue:null,marketSpread:null,referencePrice:100};
 const d=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(d.alert,false);assert(d.reasons.includes('sold-market-unknown'));
}
{
 const o=strong();delete o.marketReality;o.priceConsensus={confidence:95,sourceCount:3,conflicting:false};
 const permissive=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1});
 assert.equal(permissive.alert,true);
 const strict=gate.shouldAlert(o,{now:new Date('2026-08-31T11:00:00Z').getTime(),minProfit:1,minRoi:1,minFlipScore:1,minAnomalyConfidence:1,minConfidenceAdjustedProfit:1,minConfidenceAdjustedRoi:1,requireSoldMarketReality:true});
 assert.equal(strict.alert,false);assert(strict.reasons.includes('sold-market-reality-missing'));
}
console.log('consensus-alert tests passed');