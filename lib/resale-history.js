(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQResaleHistory=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
const dayMs=86400000;
function median(values=[]){if(!values.length)return null;const a=[...values].sort((x,y)=>x-y);const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function percentile(values=[],p=.5){if(!values.length)return null;const a=[...values].sort((x,y)=>x-y);if(a.length===1)return a[0];const i=(a.length-1)*clamp(p,0,1);const lo=Math.floor(i),hi=Math.ceil(i),w=i-lo;return a[lo]*(1-w)+a[hi]*w;}
function normalizeStatus(v){return String(v||'').trim().toLowerCase().replace(/[\s_-]+/g,'');}
function isCompletedSale(comp={}){const s=normalizeStatus(comp.status||comp.saleStatus||comp.state);return ['sold','completed','completedsale','fulfilled'].includes(s)&&!!comp.soldAt;}
function deliveredPrice(comp={}){const price=Math.max(0,Number(comp.price==null?comp.salePrice:comp.price)||0);const shipping=Math.max(0,Number(comp.shipping)||0);return money(price+shipping);}
function normalizeComp(comp={},asOf=new Date()){
  if(!isCompletedSale(comp))return null;
  const soldAt=new Date(comp.soldAt);if(Number.isNaN(soldAt.getTime()))return null;
  const ageDays=Math.max(0,(asOf-soldAt)/dayMs);
  const total=deliveredPrice(comp);if(!(total>0))return null;
  return{...comp,soldAt:soldAt.toISOString(),ageDays:+ageDays.toFixed(2),deliveredPrice:total,matchScore:clamp(comp.matchScore==null?100:comp.matchScore,0,100),sourceConfidence:clamp(comp.sourceConfidence==null?100:comp.sourceConfidence,0,100)};
}
function summarizeWindow(comps=[],days=30){
  const rows=comps.filter(c=>c.ageDays<=days);const prices=rows.map(c=>c.deliveredPrice);if(!rows.length)return{days,count:0,median:null,mean:null,p25:null,p75:null,min:null,max:null,dispersion:null,matchQuality:0,sourceQuality:0,confidence:0};
  const med=median(prices),p25=percentile(prices,.25),p75=percentile(prices,.75);const mean=prices.reduce((a,b)=>a+b,0)/prices.length;const dispersion=med>0?(p75-p25)/med:1;
  const matchQuality=rows.reduce((s,c)=>s+c.matchScore,0)/rows.length;const sourceQuality=rows.reduce((s,c)=>s+c.sourceConfidence,0)/rows.length;
  const sampleScore=clamp((Math.log2(rows.length+1)/Math.log2(21))*100,0,100);const freshnessScore=clamp(100-(median(rows.map(c=>c.ageDays))/Math.max(1,days))*45,35,100);const dispersionScore=clamp(100-dispersion*90,10,100);
  const confidence=.34*sampleScore+.22*freshnessScore+.18*dispersionScore+.16*matchQuality+.10*sourceQuality;
  return{days,count:rows.length,median:money(med),mean:money(mean),p25:money(p25),p75:money(p75),min:money(Math.min(...prices)),max:money(Math.max(...prices)),dispersion:+dispersion.toFixed(3),matchQuality:+matchQuality.toFixed(1),sourceQuality:+sourceQuality.toFixed(1),confidence:Math.round(clamp(confidence,0,100))};
}
function buildResaleHistory(rawComps=[],options={}){
  const asOf=new Date(options.asOf||Date.now());
  const comps=(rawComps||[]).map(c=>normalizeComp(c,asOf)).filter(Boolean).filter(c=>c.ageDays<=Math.max(90,Number(options.maxAgeDays)||90));
  const windows={d30:summarizeWindow(comps,30),d60:summarizeWindow(comps,60),d90:summarizeWindow(comps,90)};
  const preferred=windows.d30.count>=3?windows.d30:(windows.d60.count>=3?windows.d60:windows.d90);
  const trend=windows.d30.median&&windows.d90.median?money((windows.d30.median-windows.d90.median)/windows.d90.median*100):null;
  const confidence=preferred.count?Math.round(.7*preferred.confidence+.3*windows.d90.confidence):0;
  return{asOf:asOf.toISOString(),completedSaleOnly:true,comparableCount:comps.length,windows,marketValue:preferred.median,marketValueWindow:preferred.days,resaleConfidence:confidence,trend30vs90Pct:trend,evidenceSufficient:preferred.count>=3&&confidence>=45};
}
return{median,percentile,isCompletedSale,deliveredPrice,normalizeComp,summarizeWindow,buildResaleHistory};
});