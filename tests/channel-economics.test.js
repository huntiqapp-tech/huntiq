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
assert(result.best.breakEvenSalePrice>0,'break-even sale price must be calculated');
assert(result.best.marginOfSafety>0,'profitable channel should have positive resale safety margin');
assert(result.best.maxBuyPrice>=opportunity.price,'profitable channel should tolerate at least the current buy price');
assert(result.best.targetRoiCeilings.roi25>result.best.targetRoiCeilings.roi50,'higher target ROI must lower acquisition ceiling');
assert(result.best.targetRoiCeilings.roi50>result.best.targetRoiCeilings.roi100,'100% target ROI must have the most conservative buy ceiling');
assert.strictEqual(result.best.acquisitionHeadroom,+((result.best.maxBuyPrice-opportunity.price).toFixed(2)),'headroom should equal break-even ceiling less current price');
assert.strictEqual(result.best.target50Headroom,+((result.best.targetRoiCeilings.roi50-opportunity.price).toFixed(2)),'50% target headroom should compare current price to the target ceiling');
assert(result.channels[0].score>=result.channels[1].score,'channels should be ranked by risk-aware exit score');
const local=result.channels.find(x=>x.name==='Local pickup');
assert.strictEqual(local.totalFees,0,'zero-fee local sale must not inherit marketplace fees');
assert(local.shipping===0,'local pickup should preserve zero shipping');
const high=result.channels.find(x=>x.name==='High-fee venue');
assert(high.totalFees>result.channels.find(x=>x.name==='Marketplace A').totalFees,'higher fee rate should increase sale fees');
const nearBreakEven=C.evaluateChannel({price:100,taxRate:0,resale:{marketValue:120,resaleConfidence:90}},{name:'Thin margin',feeRate:.1,salePrice:112,confidence:90});
assert(nearBreakEven.marginOfSafety<10,'thin-margin resale exits should expose low break-even safety');
const weak=C.evaluateChannel({...opportunity,resale:{...opportunity.resale,resaleConfidence:20}},{name:'Thin comps',feeRate:.1,confidence:20});
const strong=C.evaluateChannel(opportunity,{name:'Strong comps',feeRate:.1,confidence:95});
assert(strong.confidenceAdjustedProfit>weak.confidenceAdjustedProfit,'stronger resale evidence should preserve more expected profit');
const clean=C.evaluateChannel(opportunity,{name:'Low-return venue',salePrice:215,feeRate:.12,shipping:12,confidence:88,returnRate:.02,returnShipping:8,returnHandlingCost:3,nonRefundableFeeRate:.02});
const risky=C.evaluateChannel(opportunity,{name:'High-return venue',salePrice:215,feeRate:.12,shipping:12,confidence:88,returnRate:.28,returnShipping:14,returnHandlingCost:8,nonRefundableFeeRate:.05});
assert(risky.expectedReturnCost>clean.expectedReturnCost,'higher return exposure should raise expected return cost');
assert(risky.riskAdjustedProfit<clean.riskAdjustedProfit,'return exposure should reduce risk-adjusted profit');
assert(risky.riskAdjustedRoi<clean.riskAdjustedRoi,'return exposure should reduce risk-adjusted ROI');
assert(risky.maxBuyPrice<clean.maxBuyPrice,'higher return exposure should lower the safe acquisition price');
assert(risky.targetRoiCeilings.roi50<clean.targetRoiCeilings.roi50,'return exposure should also lower target-ROI acquisition ceilings');
const directCeiling=C.maxBuyPriceForTargetRoi({salePrice:200,feeRate:.1,shipping:10,targetRoi:50});
assert.strictEqual(directCeiling,110,'target ROI ceiling formula should solve backwards from net sale proceeds');
const returnRank=C.compareChannels(opportunity,[
  {name:'Risky marketplace',salePrice:230,feeRate:.1,shipping:10,confidence:90,returnRate:.4,returnShipping:18,returnHandlingCost:12,nonRefundableFeeRate:.08},
  {name:'Safer marketplace',salePrice:220,feeRate:.1,shipping:10,confidence:90,returnRate:.02,returnShipping:8,returnHandlingCost:3,nonRefundableFeeRate:.01}
]);
assert.strictEqual(returnRank.best.name,'Safer marketplace','channel ranking should prefer stronger expected economics over a higher sticker resale price');
assert('riskAdjustedProfit' in returnRank.spread,'comparison spread should report risk-adjusted profit separation');
assert('target50Headroom' in returnRank.spread,'comparison spread should report target-ROI acquisition headroom separation');
console.log('HUNTIQ channel economics tests passed',{best:result.best,spread:result.spread,returnRiskBest:returnRank.best});
