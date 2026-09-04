'use strict';
const assert=require('assert');
const fs=require('fs');
const Pwa=require('../lib/pwa-opportunity');
const asOf='2026-09-01T18:00:00.000Z';
const deal={id:'demo-1',sku:'DEMO-1',price:40,priceHistory:[120,120,118,119,120,120,118,120],comps:{d30:120,d60:116,d90:112},feeRate:.135,shipping:8,taxRate:.06,dataQuality:.95,holdingCostPerDay:.1};
const legacy={observedAt:asOf,anomaly:{confidence:90,phase:'new-drop'},resale:{estimatedDaysToSell:18}};
const out=Pwa.evaluateForPwa(deal,legacy,{asOf});
assert.equal(out.demoComparables,true);
assert.equal(out.comparables.length,9);
assert(out.comparables.every(c=>c.status==='sold'&&c.evidenceClass==='completed_sale'));
assert(out.resale.completedSaleOnly);
assert(out.resale.marketValue>0);
assert(out.economics.riskAdjustedProfit>0);
assert(out.economics.riskAdjustedRoi>0);
assert.equal(out.marketReality.soldMarketValue,out.resale.marketValue);
assert.equal(out.marketReality.referencePriceAuthoritative,false);
assert.equal(out.marketReality.verdict,'below-sold-market');
assert(['strong-buy','buy','watch','skip'].includes(out.recommendation));
const supplied=[{status:'sold',price:100,soldAt:'2026-08-30T18:00:00.000Z',matchScore:98,sourceConfidence:99,evidenceClass:'completed_sale'}];
const custom=Pwa.evaluateForPwa({...deal,completedSales:supplied},legacy,{asOf});
assert.equal(custom.demoComparables,false);
assert.equal(custom.comparables.length,1);
const liveWithoutSold=Pwa.evaluateForPwa({...deal,dataOrigin:'live',validationState:'validated'},legacy,{asOf});
assert.equal(liveWithoutSold.demoComparables,false);
assert.equal(liveWithoutSold.comparables.length,0,'live retailer data must never synthesize demo sold evidence');
assert.equal(liveWithoutSold.marketReality.verdict,'sold-market-unknown');
assert.equal(liveWithoutSold.marketReality.referencePriceAuthoritative,false);

const falseDealComps=[
  {status:'sold',price:62,soldAt:'2026-08-30T18:00:00.000Z',matchScore:98,sourceConfidence:99},
  {status:'sold',price:60,soldAt:'2026-08-27T18:00:00.000Z',matchScore:98,sourceConfidence:99},
  {status:'sold',price:59,soldAt:'2026-08-22T18:00:00.000Z',matchScore:98,sourceConfidence:99},
  {status:'sold',price:61,soldAt:'2026-08-15T18:00:00.000Z',matchScore:98,sourceConfidence:99}
];
const timeline=[0,7,14,21].flatMap((d,i)=>{const observedAt=new Date(new Date(asOf).getTime()-(d+1)*86400000).toISOString();return[{price:70+i,observedAt,priceBasis:'raw-shelf'},{price:160,observedAt,priceBasis:'msrp'}];});
const falseDeal=Pwa.evaluateForPwa({...deal,price:69,msrp:160,listPrice:160,referencePrice:160,timeline,completedSales:falseDealComps},legacy,{asOf});
assert.equal(falseDeal.marketReality.referencePrice,160);
assert(falseDeal.marketReality.referenceDiscountPct>50,'retailer reference discount may be displayed as context');
assert.equal(falseDeal.marketReality.referencePriceAuthoritative,false,'reference/MSRP must never be authoritative');
assert.equal(falseDeal.marketReality.verdict,'above-sold-market','retail price above real sold-market value must be identified');
assert(falseDeal.marketReality.marketSpread<0,'market spread must expose the lack of resale edge');
assert.match(falseDeal.marketReality.note,/no positive spread/i);
assert.equal(falseDeal.historyAssessment.excludedReferenceObservationCount,4,'PWA must inherit reference-price quarantine from history scoring');
assert(falseDeal.historyAssessment.baseline<75,'PWA anomaly baseline must use actual observed price history');
assert.equal(falseDeal.recommendation,'skip');
const inflatedReference=Pwa.evaluateForPwa({...deal,price:69,msrp:1600,listPrice:1600,referencePrice:1600,timeline:timeline.map(x=>x.priceBasis==='msrp'?{...x,price:1600}:x),completedSales:falseDealComps},legacy,{asOf});
assert.equal(inflatedReference.resale.marketValue,falseDeal.resale.marketValue,'inflated MSRP must not change sold-market value');
assert.equal(inflatedReference.economics.riskAdjustedProfit,falseDeal.economics.riskAdjustedProfit,'inflated MSRP must not change profit');
assert.equal(inflatedReference.economics.riskAdjustedRoi,falseDeal.economics.riskAdjustedRoi,'inflated MSRP must not change ROI');
assert.equal(inflatedReference.economics.decisionFloorProfit,falseDeal.economics.decisionFloorProfit,'inflated MSRP must not change conservative profit floor');
assert.equal(inflatedReference.economics.decisionFloorRoi,falseDeal.economics.decisionFloorRoi,'inflated MSRP must not change conservative ROI floor');
assert.equal(inflatedReference.recommendation,'skip');
const runtime=fs.readFileSync(require.resolve('../lib/pwa-runtime'),'utf8');
assert(runtime.includes("d.marketReality=strict.marketReality||null"),'strict market reality must reach customer cards');
assert(runtime.includes('gross edge before fees'),'customer copy must not confuse gross sold-market spread with profit');
assert(runtime.includes('context only, never resale value'),'reference prices must be visibly quarantined from resale value');
console.log('pwa-opportunity tests passed');
