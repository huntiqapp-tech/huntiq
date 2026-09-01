(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQHistoryAnomaly=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DAY=86400000;const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function median(values=[]){const a=values.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function assessHistory({currentPrice,history=[],observations=[],asOf=new Date().toISOString(),evidenceQuality=1,inferredIntervalDays=7}={}){
  const now=new Date(asOf).getTime();const rows=(observations||[]).map(o=>({price:Number(o&&o.price),at:new Date(o&&o.observedAt).getTime()})).filter(o=>o.price>0&&Number.isFinite(o.at));
  const prices=rows.length?rows.map(r=>r.price):(history||[]).map(Number).filter(n=>n>0&&Number.isFinite(n));const sampleCount=prices.length;const baseline=median(prices);currentPrice=Number(currentPrice);
  if(!(baseline>0)||!(currentPrice>=0))return{sampleCount,spanDays:0,baseline:null,madPct:null,volatilityScore:0,freshnessScore:0,dropPct:0,zLike:0,confidence:0,label:'insufficient-history'};
  const mad=median(prices.map(v=>Math.abs(v-baseline)))||Math.max(1,baseline*.01);const madPct=mad/baseline*100;const dropPct=clamp((1-currentPrice/baseline)*100,-100,100);const zLike=(baseline-currentPrice)/(1.4826*mad);
  const spanDays=rows.length>1?(Math.max(...rows.map(r=>r.at))-Math.min(...rows.map(r=>r.at)))/DAY:Math.max(0,(sampleCount-1)*Number(inferredIntervalDays||7));
  const newest=rows.length?Math.max(...rows.map(r=>r.at)):now;const ageDays=Math.max(0,(now-newest)/DAY);const freshnessScore=clamp(100-ageDays*6,0,100);const volatilityScore=clamp(100-madPct*7,10,100);const sampleScore=clamp(sampleCount/12*100,0,100);const spanScore=clamp(spanDays/42*100,0,100);const dropSignal=clamp(dropPct/65*100,0,100);const outlierSignal=clamp(zLike/6*100,0,100);const evidence=clamp(evidenceQuality,0,1);
  const raw=.30*dropSignal+.24*outlierSignal+.18*sampleScore+.12*spanScore+.08*freshnessScore+.08*volatilityScore;const confidence=Math.round(clamp(raw*evidence,0,99));
  let label='normal';if(confidence>=82&&dropPct>=55)label='high-confidence-anomaly';else if(confidence>=65&&dropPct>=35)label='strong-markdown';else if(dropPct>=20)label='markdown-watch';else if(sampleCount<3)label='thin-history';
  return{sampleCount,spanDays:+spanDays.toFixed(1),baseline:+baseline.toFixed(2),madPct:+madPct.toFixed(2),volatilityScore:Math.round(volatilityScore),freshnessScore:Math.round(freshnessScore),dropPct:+dropPct.toFixed(1),zLike:+zLike.toFixed(2),confidence,label};
}
return{median,assessHistory};
});