const assert=require('assert');
const R=require('../lib/resale-history.js');
const Gate=require('../lib/evidence-gate.js');
const asOf='2026-09-01T16:00:00.000Z';

const recent=[
 {status:'sold',soldAt:'2026-08-31T16:00:00Z',price:110,matchScore:100,sourceConfidence:95},
 {status:'sold',soldAt:'2026-08-27T16:00:00Z',price:115,matchScore:98,sourceConfidence:95},
 {status:'sold',soldAt:'2026-08-20T16:00:00Z',price:112,matchScore:96,sourceConfidence:90}
];
const recentHistory=R.buildResaleHistory(recent,{asOf});
assert(recentHistory.resaleFreshnessScore>=80,'recent completed sales should have strong freshness');
assert(recentHistory.newestSaleAgeDays<=2,'freshest completed sale age should be exposed');
assert.strictEqual(recentHistory.evidenceSufficient,true,'recent strong sold evidence should remain sufficient');

const old=[
 {status:'sold',soldAt:'2026-06-06T16:00:00Z',price:110,matchScore:100,sourceConfidence:95},
 {status:'sold',soldAt:'2026-06-09T16:00:00Z',price:115,matchScore:98,sourceConfidence:95},
 {status:'sold',soldAt:'2026-06-12T16:00:00Z',price:112,matchScore:96,sourceConfidence:90},
 {status:'sold',soldAt:'2026-06-14T16:00:00Z',price:111,matchScore:96,sourceConfidence:90}
];
const oldHistory=R.buildResaleHistory(old,{asOf});
assert(oldHistory.resaleFreshnessScore<60,'old 90-day comps should be identified as aging evidence');

const base={
 history:{sampleCount:20,spanDays:60,confidence:90,historyCoverageScore:95},
 anomaly:{confidence:90},
 economics:{riskAdjustedRoi:80,riskAdjustedProfit:80,downsideRoi:50,confidenceAdjustedRoi:45,target50Headroom:20},
 deal:{verified:true,fresh:true},
 liquidity:{liquidityScore:85,capitalEfficiencyScore:80,liquidityBand:'fast',daysToSell:20}
};
const aging=Gate.evaluateEvidence({...base,resale:{confidence:90,soldCount90:8,priceIntegrity:100,resaleFreshnessScore:50,newestSaleAgeDays:50,medianSaleAgeDays:68}});
assert(aging.warnings.includes('aging-resale-evidence'),'aging sold evidence should produce a warning');
assert.notStrictEqual(aging.alertLevel,'instant','aging sold evidence must not create instant urgency');
const stale=Gate.evaluateEvidence({...base,resale:{confidence:90,soldCount90:8,priceIntegrity:100,resaleFreshnessScore:20,newestSaleAgeDays:72,medianSaleAgeDays:81}});
assert(stale.blockers.includes('stale-resale-evidence'),'very stale sold evidence should block alerts');
assert.strictEqual(stale.alertLevel,'suppressed','very stale sold evidence should be suppressed');
console.log('HUNTIQ resale freshness tests passed',{recent:recentHistory.resaleFreshnessScore,old:oldHistory.resaleFreshnessScore,aging:aging.alertLevel,stale:stale.alertLevel});