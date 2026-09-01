(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAlertDedupe=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const round=(n,d=2)=>+((Number(n)||0).toFixed(d));
const minutesBetween=(a,b)=>Math.max(0,(new Date(a).getTime()-new Date(b).getTime())/60000);
function fingerprint(input={}){
  const id=input.opportunityId||input.productId||input.sku||input.upc||'unknown';
  const retailer=input.retailer||'unknown';
  const store=input.storeId||input.locationId||'unknown';
  const level=input.alertLevel||input.priority||'standard';
  return [retailer,store,id,level].map(x=>String(x).trim().toLowerCase()).join('|');
}
function shouldSendAlert({candidate={},previous=null,asOf=new Date().toISOString(),cooldownMinutes=180,minPriceDropPct=3,minProfitIncreasePct=8}={}){
  const eligible=candidate.alertEligible!==false&&candidate.alert!==false&&String(candidate.alertLevel||candidate.priority||'').toLowerCase()!=='suppressed';
  const key=fingerprint(candidate);
  if(!eligible)return{send:false,reason:'not-eligible',fingerprint:key};
  if(!previous)return{send:true,reason:'first-alert',fingerprint:key};
  if(previous.fingerprint&&previous.fingerprint!==key)return{send:true,reason:'new-alert-state',fingerprint:key};
  const ageMinutes=minutesBetween(asOf,previous.sentAt||previous.createdAt||asOf);
  const currentPrice=Number(candidate.price||candidate.currentPrice||0);
  const previousPrice=Number(previous.price||previous.currentPrice||0);
  const currentProfit=Number(candidate.profit||candidate.riskAdjustedProfit||0);
  const previousProfit=Number(previous.profit||previous.riskAdjustedProfit||0);
  const priceDropPct=previousPrice>0&&currentPrice>0?((previousPrice-currentPrice)/previousPrice)*100:0;
  const profitIncreasePct=previousProfit>0?((currentProfit-previousProfit)/previousProfit)*100:0;
  const materiallyImproved=priceDropPct>=minPriceDropPct||profitIncreasePct>=minProfitIncreasePct||Boolean(candidate.forceAlert);
  if(materiallyImproved)return{send:true,reason:priceDropPct>=minPriceDropPct?'price-improved':profitIncreasePct>=minProfitIncreasePct?'profit-improved':'forced',fingerprint:key,ageMinutes:round(ageMinutes,1),priceDropPct:round(priceDropPct),profitIncreasePct:round(profitIncreasePct)};
  if(ageMinutes<cooldownMinutes)return{send:false,reason:'cooldown',fingerprint:key,ageMinutes:round(ageMinutes,1),priceDropPct:round(priceDropPct),profitIncreasePct:round(profitIncreasePct)};
  return{send:true,reason:'cooldown-expired',fingerprint:key,ageMinutes:round(ageMinutes,1),priceDropPct:round(priceDropPct),profitIncreasePct:round(profitIncreasePct)};
}
return{fingerprint,shouldSendAlert};
});