const assert=require('assert');
const pc=require('../lib/price-consensus');
const now=new Date('2026-08-31T11:00:00Z').getTime();

{
  const a=pc.assess([
    {source:'retailer-page',price:49.03,observedAt:'2026-08-31T10:30:00Z'},
    {source:'hunter-receipt',price:49.03,observedAt:'2026-08-31T10:40:00Z'},
    {source:'store-scan',price:49.00,observedAt:'2026-08-31T10:45:00Z'}
  ],{now});
  assert.equal(a.sourceCount,3);assert(a.confidence>=85);assert.equal(a.conflicting,false);assert(a.sourceAgreement>=99);
}
{
  const a=pc.assess([
    {source:'retailer-page',price:49.03,observedAt:'2026-08-31T10:30:00Z'},
    {source:'hunter-report',price:129,observedAt:'2026-08-31T10:40:00Z'}
  ],{now});
  assert.equal(a.conflicting,true);assert(a.confidence<65);assert(a.spreadPct>50);
}
{
  const a=pc.assess([{source:'retailer-page',price:49.03,observedAt:'2026-08-25T10:30:00Z'}],{now,maxAgeHours:72});
  assert.equal(a.validCount,0);assert.equal(a.staleOrInvalidCount,1);
}
{
  const o=pc.applyToOpportunity({evidenceQuality:1},[{source:'one',price:50,observedAt:'2026-08-31T10:30:00Z'}],{now});
  assert(o.evidenceQuality<1);assert(o.priceConsensus);
}
console.log('price-consensus tests passed');