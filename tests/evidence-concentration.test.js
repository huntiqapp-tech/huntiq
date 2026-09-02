const assert=require('assert');
const C=require('../lib/evidence-concentration');
const asOf='2026-09-02T15:00:00Z';
const clustered=[
 {soldAt:'2026-08-30T10:00:00Z'},{soldAt:'2026-08-30T11:00:00Z'},{soldAt:'2026-08-30T12:00:00Z'},{soldAt:'2026-08-30T13:00:00Z'},{soldAt:'2026-08-22T10:00:00Z'}
];
const distributed=[
 {soldAt:'2026-08-30T10:00:00Z'},{soldAt:'2026-08-27T11:00:00Z'},{soldAt:'2026-08-24T12:00:00Z'},{soldAt:'2026-08-20T13:00:00Z'},{soldAt:'2026-08-16T10:00:00Z'}
];
const a=C.assessEvidenceConcentration(clustered,{asOf});const b=C.assessEvidenceConcentration(distributed,{asOf});
assert(a.score<b.score,'clustered sales should score lower than distributed sales');
assert(a.warnings.includes('evidence-clustered-on-one-day'));
assert.strictEqual(b.uniqueDays,5);
assert.strictEqual(C.capConfidence(92,a),a.score);
const future=C.assessEvidenceConcentration([{soldAt:'2026-09-03T00:00:00Z'}],{asOf});
assert.strictEqual(future.sampleCount,0,'future timestamps must not count as evidence');
console.log('evidence concentration tests passed');