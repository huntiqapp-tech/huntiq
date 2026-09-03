const assert=require('assert');
const {assessBreakEvenResilience}=require('../lib/break-even-resilience');

const strong=assessBreakEvenResilience({salePrice:140,acquisitionCost:55,marketplaceFeePct:13.25,paymentFixedFee:.30,shippingCost:8,packagingCost:1,returnReservePct:3,minNetProfit:10,minRoiPct:30,anomalyConfidence:92,resaleConfidence:90,evidenceConfidence:88});
assert(strong.netProfit>50);
assert(strong.salePriceCushionPct>20);
assert(strong.acquisitionCostCushionPct>20);
assert(['strong','moderate'].includes(strong.band));
assert.equal(strong.eligibleForUrgentAlert,true);
assert.equal(strong.stressedAlertState,'instant');

const thin=assessBreakEvenResilience({salePrice:80,acquisitionCost:50,marketplaceFeePct:13.25,paymentFixedFee:.30,shippingCost:7,packagingCost:1,returnReservePct:3,minNetProfit:8,minRoiPct:20,anomalyConfidence:90,resaleConfidence:88,evidenceConfidence:85});
assert(thin.salePriceCushionPct<12);
assert(thin.warnings.includes('thin-sale-price-cushion')||thin.blockers.includes('sale-price-cushion-fragile'));
assert.notEqual(thin.stressedAlertState,'instant');

const weakEvidence=assessBreakEvenResilience({salePrice:120,acquisitionCost:55,shippingCost:8,packagingCost:1,minNetProfit:8,minRoiPct:25,anomalyConfidence:91,resaleConfidence:52,evidenceConfidence:80});
assert.equal(weakEvidence.weakestConfidence,52);
assert(weakEvidence.warnings.includes('weak-evidence-reduces-resilience'));
assert(weakEvidence.resilienceScore<strong.resilienceScore);

const failed=assessBreakEvenResilience({salePrice:70,acquisitionCost:55,shippingCost:8,packagingCost:2,minNetProfit:8,minRoiPct:25});
assert(failed.blockers.includes('profit-floor-not-met')||failed.blockers.includes('roi-floor-not-met'));
assert.equal(failed.eligibleForUrgentAlert,false);
assert.equal(failed.stressedAlertState,'digest');
console.log('break-even resilience tests passed');
