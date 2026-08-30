const assert=require('assert');
const C=require('../lib/channel-economics.js');
const opportunity={price:100,taxRate:.06,holdingCostPerDay:.2,resale:{marketValue:220,resaleConfidence:80,estimatedDaysToSell:10}};
const result=C.compareChannels(opportunity,[
  {name:'Marketplace A',feeRate:.14,shipping:15,confidence:90},
  {name:'Local pickup',feeRate:0,shipping:0,salePrice:185,confidence:75,holdingDays:4},
  {name:'High-fee venue',feeRate:.25,shipping:20,confidence:95}
]);
assert.strictEqual(result.channels.length,3);
assert(result.best,'a best exit channel must be selected');
assert(result.best.profit>0,'best channel should remain profitable');
assert(result.best.roi>0,'best channel should have positive ROI');
assert(result.channels[0].score>=result.channels[1].score,'channels should be ranked by risk-aware exit score');
const local=result.channels.find(x=>x.name==='Local pickup');
assert.strictEqual(local.totalFees,0,'zero-fee local sale must not inherit marketplace fees');
assert(local.shipping===0,'local pickup should preserve zero shipping');
const high=result.channels.find(x=>x.name==='High-fee venue');
assert(high.totalFees>result.channels.find(x=>x.name==='Marketplace A').totalFees,'higher fee rate should increase sale fees');
const weak=C.evaluateChannel({...opportunity,resale:{...opportunity.resale,resaleConfidence:20}},{name:'Thin comps',feeRate:.1,confidence:20});
const strong=C.evaluateChannel(opportunity,{name:'Strong comps',feeRate:.1,confidence:95});
assert(strong.confidenceAdjustedProfit>weak.confidenceAdjustedProfit,'stronger resale evidence should preserve more expected profit');
console.log('HUNTIQ channel economics tests passed',{best:result.best,spread:result.spread});
