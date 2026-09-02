'use strict';
const assert=require('assert');
const Resale=require('../lib/resale-history');
const Gate=require('../lib/evidence-gate');
const asOf='2026-09-01T12:00:00.000Z';
const sold=(price,daysAgo)=>({status:'sold',soldAt:new Date(new Date(asOf).getTime()-daysAgo*86400000).toISOString(),price,shipping:0,matchScore:100,sourceConfidence:100});

const clean=[sold(100,2),sold(102,5),sold(98,8),sold(101,12),sold(99,18),sold(103,24)];
const cleanHistory=Resale.buildResaleHistory(clean,{asOf});
assert.strictEqual(cleanHistory.outlierCount,0);
assert.strictEqual(cleanHistory.priceIntegrity,100);
assert.strictEqual(cleanHistory.marketValue,100.5);

const contaminated=[...clean,sold(799,10)];
const robust=Resale.buildResaleHistory(contaminated,{asOf});
assert.strictEqual(robust.outlierCount,1,'extreme sold price should be filtered');
assert(robust.priceIntegrity<100&&robust.priceIntegrity>=70,'integrity should reflect filtered evidence');
assert(robust.marketValue<110,'extreme comp must not inflate market value');
assert.strictEqual(robust.marketValueBasis,'d30-verified-sold-robust');

const weakGate=Gate.evaluateEvidence({history:{sampleCount:12,spanDays:45,confidence:90},anomaly:{confidence:90},resale:{confidence:90,soldCount90:8,priceIntegrity:60,outlierCount:3},economics:{riskAdjustedRoi:60,riskAdjustedProfit:80,downsideRoi:30,confidenceAdjustedRoi:40},deal:{verified:true,fresh:true}});
assert.strictEqual(weakGate.alertEligible,false);
assert(weakGate.blockers.includes('weak-resale-price-integrity'));

const warningGate=Gate.evaluateEvidence({history:{sampleCount:12,spanDays:45,confidence:90},anomaly:{confidence:90},resale:{confidence:90,soldCount90:8,priceIntegrity:85,outlierCount:1},economics:{riskAdjustedRoi:60,riskAdjustedProfit:80,downsideRoi:30,confidenceAdjustedRoi:40},deal:{verified:true,fresh:true}});
assert(warningGate.warnings.includes('resale-price-outliers-filtered'));
assert.notStrictEqual(warningGate.alertLevel,'instant','sub-90 price integrity should cap urgency');
console.log('resale-integrity.test.js passed');