(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQResaleDecay=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+((Number(n)||0).toFixed(2));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function evaluateResaleDecay({marketValue=0,trend30vs90Pct=null,purchaseQuantity=1,partialLiquidation=null,resaleConfidence=100}={}){
  const value=Math.max(0,Number(marketValue)||0);const quantity=Math.max(1,Math.floor(Number(purchaseQuantity)||1));
  const trend=trend30vs90Pct==null?null:Number(trend30vs90Pct);const observedDeclinePct=trend!=null&&trend<0?Math.abs(trend):0;
  const confidenceStressPct=clamp((100-clamp(resaleConfidence,0,100))*.02,0,2);
  const monthlyDecayPct=round(clamp(observedDeclinePct/2+confidenceStressPct,0,20),2);
  const factor=Math.max(0,1-monthlyDecayPct/100);const priceAt=days=>money(value*Math.pow(factor,days/30));
  const prices={d30:priceAt(30),d60:priceAt(60),d90:priceAt(90)};
  const horizons=partialLiquidation&&Array.isArray(partialLiquidation.horizons)?partialLiquidation.horizons:[];const soldAt=days=>{const h=horizons.find(x=>Number(x.days)===days);return h?Math.min(quantity,Math.max(0,Math.floor(Number(h.expectedUnitsSold)||0))):0;};
  const sold30=soldAt(30),sold60=Math.max(sold30,soldAt(60)),sold90=Math.max(sold60,soldAt(90));
  const tranche30=sold30,tranche60=Math.max(0,sold60-sold30),tranche90=Math.max(0,sold90-sold60),unsold90=Math.max(0,quantity-sold90);
  const weightedGross=value>0?(tranche30*prices.d30+tranche60*prices.d60+(tranche90+unsold90)*prices.d90):0;
  const weightedSalePrice=quantity>0?money(weightedGross/quantity):0;const weightedDecayPct=value>0?round(clamp((1-weightedSalePrice/value)*100,0,100),1):0;
  const unsold90Pct=round(unsold90/quantity*100,1);const decayScore=Math.round(clamp(100-weightedDecayPct*2-unsold90Pct*.15,0,100));
  const blockers=[];const warnings=[];
  if(value<=0)blockers.push('missing-resale-market-value');
  if(quantity>1&&observedDeclinePct>=25&&weightedDecayPct>=15)blockers.push('severe-resale-price-decay');
  else if(weightedDecayPct>=8)warnings.push('meaningful-resale-price-decay');
  if(trend==null&&quantity>1)warnings.push('resale-decay-trend-unavailable');
  return{marketValue:money(value),purchaseQuantity:quantity,trend30vs90Pct:trend==null?null:round(trend,1),observedDeclinePct:round(observedDeclinePct,1),monthlyDecayPct,prices,units:{sold30,sold60,sold90,unsold90,tranche30,tranche60,tranche90},weightedSalePrice,weightedDecayPct,unsold90Pct,decayScore,blockers,warnings};
}
return{evaluateResaleDecay};
});