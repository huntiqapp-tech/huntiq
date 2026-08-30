const assert=require('assert');
const E=require('../lib/engine.js');

const m=E.median([10,50,20,30]);
assert.strictEqual(m,25);

const resale=E.resaleSummary({d30:500,d60:480,d90:460,soldCount:30,currentAsks:[520,540,500]});
assert(resale.marketValue>480&&resale.marketValue<500);
assert.strictEqual(resale.askingMedian,520);
assert.strictEqual(resale.conservativeValue,460);
assert.strictEqual(resale.upsideValue,500);
assert.strictEqual(resale.windowCoverage,1);
assert(resale.spreadPct>0);
assert(resale.resaleConfidence>70);
assert(resale.salesPerDay>0);
assert(resale.estimatedDaysToSell>0);

const tight=E.resaleSummary({d30:500,d60:495,d90:490,soldCount:30,currentAsks:[505,500,495]});
const noisy=E.resaleSummary({d30:600,d60:450,d90:300,soldCount:30,currentAsks:[800,850,900]});
assert(tight.resaleConfidence>noisy.resaleConfidence);
assert(noisy.spreadPct>tight.spreadPct);

const missing30=E.weightedMedianMarket({d60:400,d90:300,currentAsks:[900]});
assert(Math.abs(missing30-360)<0.01);

const econ=E.economics({buyPrice:100,marketValue:300,feeRate:0.13,shipping:20,taxRate:0.06});
assert.strictEqual(econ.fees,39);
assert.strictEqual(econ.purchaseTax,6);
assert(econ.profit>130&&econ.profit<140);
assert(econ.roi>100);
assert(econ.breakEvenSalePrice>140&&econ.breakEvenSalePrice<150);
const held=E.economics({buyPrice:100,marketValue:300,feeRate:0.13,shipping:20,taxRate:0.06,holdingDays:10,holdingCostPerDay:1});
assert.strictEqual(held.holdingCost,10);
assert(held.profit<econ.profit&&held.roi<econ.roi);

const anomaly=E.anomalyScore({currentPrice:99,history:[399,399,379,399,399,389,399,399,399,399,399,399,399,399],dataQuality:1});
assert(anomaly.dropPct>70);
assert(anomaly.confidence>=85);
assert.strictEqual(anomaly.label,'Probable Error');
const weakEvidence=E.anomalyScore({currentPrice:99,history:[399,399,379,399,399,389,399,399,399,399,399,399,399,399],dataQuality:1,evidenceQuality:.4});
assert(weakEvidence.confidence<anomaly.confidence);
assert(weakEvidence.quality===.4);
const weakConfirmation=E.anomalyScore({currentPrice:99,history:[399,399,379,399,399,389,399,399,399,399,399,399,399,399],dataQuality:1,evidenceQuality:1,confirmationQuality:.2});
assert(weakConfirmation.confidence<anomaly.confidence);
assert(weakConfirmation.confirmationFactor<1);

const normal=E.anomalyScore({currentPrice:380,history:[399,389,379,399,389,379,399,389,379,399,389,379,399,389]});
assert(normal.confidence<65);

const evaluated=E.evaluateOpportunity({price:129,referencePrice:599,priceHistory:[599,599,579,599,599,599,589,599,599,599,599,599,599,599],comps:{d30:489,d60:475,d90:469,soldCount:38},feeRate:0.135,shipping:24,taxRate:0.06,holdingCostPerDay:.1,confirmationScore:90,evidenceQuality:.95});
assert(evaluated.economics.profit>250);
assert(evaluated.downsideEconomics.profit>200);
assert(evaluated.downsideEconomics.roi>100);
assert(evaluated.flipScore>=70);
assert(evaluated.anomaly.confidence>=80);
assert(evaluated.resale.estimatedDaysToSell>0);
assert(evaluated.riskAdjustedEconomics.profit<evaluated.economics.profit);
assert(evaluated.riskAdjustedEconomics.roi<evaluated.economics.roi);
const weakerRisk=E.evaluateOpportunity({price:129,referencePrice:599,priceHistory:[599,599,579,599,599,599,589,599,599,599,599,599,599,599],comps:{d30:489,d60:475,d90:469,soldCount:38},feeRate:0.135,shipping:24,taxRate:0.06,confirmationScore:30,evidenceQuality:.5});
assert(weakerRisk.riskAdjustedEconomics.profit<evaluated.riskAdjustedEconomics.profit);
console.log('HUNTIQ engine tests passed', {flipScore:evaluated.flipScore, roi:evaluated.economics.roi, riskRoi:evaluated.riskAdjustedEconomics.roi, downside:evaluated.downsideEconomics.profit, anomaly:evaluated.anomaly.confidence});