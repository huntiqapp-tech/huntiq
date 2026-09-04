const assert=require('assert');
const {assessEvidenceFreshnessRisk}=require('../lib/evidence-freshness-risk');

const fresh=assessEvidenceFreshnessRisk({observationIntegrityScore:100,acquisitionAgeMinutes:15,historyNewestAgeDays:3,historyMedianAgeDays:20,resaleNewestAgeDays:2,resaleMedianAgeDays:10,anomalyConfidence:90,resaleConfidence:88,projectedResale:180,acquisitionCost:80,sellingCosts:25});
assert.equal(fresh.blocked,false);assert.equal(fresh.alertAction,'instant');assert(fresh.freshnessAdjustedProfit>70);assert(fresh.adjustedAnomalyConfidence>80);

const staleHistory=assessEvidenceFreshnessRisk({observationIntegrityScore:100,acquisitionAgeMinutes:20,historyNewestAgeDays:220,historyMedianAgeDays:500,resaleNewestAgeDays:4,resaleMedianAgeDays:20,anomalyConfidence:92,resaleConfidence:85,projectedResale:180,acquisitionCost:80,sellingCosts:25});
assert(staleHistory.adjustedAnomalyConfidence<70);assert(staleHistory.reasons.includes('stale-price-history'));assert.notEqual(staleHistory.alertAction,'instant');

const staleResale=assessEvidenceFreshnessRisk({observationIntegrityScore:100,acquisitionAgeMinutes:15,historyNewestAgeDays:4,historyMedianAgeDays:25,resaleNewestAgeDays:150,resaleMedianAgeDays:240,anomalyConfidence:90,resaleConfidence:92,projectedResale:125,acquisitionCost:80,sellingCosts:25});
assert(staleResale.resaleHaircutPct>=15);assert(staleResale.adjustedResaleConfidence<60);assert.equal(staleResale.alertAction,'digest');

const expired=assessEvidenceFreshnessRisk({observationIntegrityScore:100,acquisitionAgeMinutes:5000,historyNewestAgeDays:4,historyMedianAgeDays:20,resaleNewestAgeDays:2,resaleMedianAgeDays:10,anomalyConfidence:95,resaleConfidence:95,projectedResale:250,acquisitionCost:100,sellingCosts:25});
assert.equal(expired.blocked,true);assert(expired.reasons.includes('stale-acquisition-observation'));assert.equal(expired.alertAction,'digest');

const contaminated=assessEvidenceFreshnessRisk({observationIntegrityScore:40,acquisitionAgeMinutes:10,historyNewestAgeDays:2,historyMedianAgeDays:10,resaleNewestAgeDays:2,resaleMedianAgeDays:10,anomalyConfidence:95,resaleConfidence:95,projectedResale:250,acquisitionCost:100,sellingCosts:25});
assert.equal(contaminated.blocked,true);assert(contaminated.reasons.includes('weak-observation-integrity'));assert.equal(contaminated.alertAction,'digest');assert(contaminated.adjustedAnomalyConfidence<80);

const negative=assessEvidenceFreshnessRisk({observationIntegrityScore:90,acquisitionAgeMinutes:10,historyNewestAgeDays:3,historyMedianAgeDays:20,resaleNewestAgeDays:90,resaleMedianAgeDays:180,anomalyConfidence:80,resaleConfidence:80,projectedResale:110,acquisitionCost:90,sellingCosts:20});
assert.equal(negative.blocked,true);assert(negative.reasons.includes('negative-freshness-adjusted-economics'));
console.log('evidence-freshness-risk tests passed');