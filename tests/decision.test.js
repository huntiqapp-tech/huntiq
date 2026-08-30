const assert=require('assert');
const Decision=require('../lib/decision');

const tight=Decision.resaleBand({marketValue:400,conservativeValue:390,soldCount:60,spreadPct:5,liquidityScore:85});
const weak=Decision.resaleBand({marketValue:400,conservativeValue:300,soldCount:4,spreadPct:45,liquidityScore:25});
assert(tight.confidence>weak.confidence,'tight liquid comps should have higher confidence');
assert(tight.low>weak.low,'tight comps should preserve a higher low estimate');

const threshold=Decision.maxBuyPrice({resaleValue:300,targetRoi:40,minProfit:50,feeRate:.13,shipping:20,taxRate:.06,holdingDays:10,holdingCostPerDay:.2});
assert(threshold.maxBuyPrice>0&&threshold.maxBuyPrice<200,'max buy should be positive and conservative');

const opportunity={price:100,feeRate:.13,shipping:15,taxRate:.06,holdingCostPerDay:.1,resale:{marketValue:300,conservativeValue:260,soldCount:40,spreadPct:8,liquidityScore:80,estimatedDaysToSell:12},risk:{liquidation:{value:240}}};
const decision=Decision.purchaseDecision(opportunity,{targetRoi:40,minProfit:50});
assert(decision.maxBuyPrice>100,'good deal should have positive purchase headroom');
assert(decision.headroom>0,'headroom should be positive');
assert.notStrictEqual(decision.verdict,'Above Max Buy');

const overpriced=Decision.purchaseDecision({...opportunity,price:250},{targetRoi:40,minProfit:50});
assert(overpriced.headroom<0,'overpriced deal should be above safe max buy');
assert.strictEqual(overpriced.verdict,'Above Max Buy');

console.log('decision tests passed');
