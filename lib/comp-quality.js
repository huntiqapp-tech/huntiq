(function(root,factory){const api=factory(root.HuntIQMatching);if(typeof module==='object'&&module.exports)module.exports=factory(require('./matching'));else root.HuntIQCompQuality=api;})(typeof globalThis!=='undefined'?globalThis:this,function(matching){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const money=n=>+(Number(n)||0).toFixed(2);
function sourceType(comp={}){const raw=String(comp.evidenceType||comp.type||comp.status||comp.sourceType||'').toLowerCase();if(raw.includes('sold')||comp.sold===true)return'sold';if(raw.includes('ask')||raw.includes('active')||comp.sold===false)return'asking';return'unknown';}
function evidenceDate(comp={}){for(const key of['soldAt','endedAt','observedAt','timestamp','updatedAt','createdAt']){if(comp[key]){const t=new Date(comp[key]).getTime();if(Number.isFinite(t))return t;}}return null;}
function recencyWeight(comp={},now=Date.now()){const t=evidenceDate(comp);if(t==null)return null;const ageDays=Math.max(0,(Number(now)-t)/864e5);const halfLife=sourceType(comp)==='sold'?45:14;return{ageDays:+ageDays.toFixed(1),weight:+Math.pow(.5,ageDays/halfLife).toFixed(3),fresh:ageDays<=45,stale:ageDays>90};}
function assess(retail={},comps=[],options={}){
  const minimumMatch=Number(options.minimumMatch||75);const now=Number(options.now||Date.now());
  const rows=(comps||[]).map(item=>({item,match:matching.productMatch(retail,item),type:sourceType(item),recency:recencyWeight(item,now)}));
  const accepted=rows.filter(x=>x.match.score>=minimumMatch);
  const sold=accepted.filter(x=>x.type==='sold');
  const asking=accepted.filter(x=>x.type==='asking');
  const exact=accepted.filter(x=>x.match.score>=90);
  const dated=accepted.filter(x=>x.recency);
  const datedSold=sold.filter(x=>x.recency);
  const freshSold=datedSold.filter(x=>x.recency.fresh);
  const staleSold=datedSold.filter(x=>x.recency.stale);
  const rejected=rows.length-accepted.length;
  const exactShare=accepted.length?exact.length/accepted.length:0;
  const soldShare=accepted.length?sold.length/accepted.length:0;
  const volumeScore=clamp((sold.length/5)*100,0,100);
  const identityScore=accepted.length?accepted.reduce((a,x)=>a+x.match.score,0)/accepted.length:0;
  const evidenceScore=clamp(55*soldShare+25*exactShare+20*(asking.length?1:0),0,100);
  const freshnessKnown=datedSold.length>0;
  const freshnessScore=freshnessKnown?clamp(datedSold.reduce((a,x)=>a+x.recency.weight,0)/datedSold.length*100,0,100):0;
  const baseConfidence=clamp(.45*identityScore+.35*volumeScore+.20*evidenceScore,0,100);
  const confidence=freshnessKnown?clamp(.82*baseConfidence+.18*freshnessScore,0,100):baseConfidence;
  const status=confidence>=80&&sold.length>=4&&freshSold.length>=2?'strong':confidence>=65&&sold.length>=2?'moderate':confidence>=45?'thin':'weak';
  return{total:rows.length,accepted:accepted.length,rejected,soldCount:sold.length,askingCount:asking.length,exactCount:exact.length,datedCount:dated.length,datedSoldCount:datedSold.length,freshSoldCount:freshSold.length,staleSoldCount:staleSold.length,exactShare:+(exactShare*100).toFixed(1),soldShare:+(soldShare*100).toFixed(1),identityScore:+identityScore.toFixed(1),freshnessKnown,freshnessScore:+freshnessScore.toFixed(1),confidence:+confidence.toFixed(1),status,acceptedRows:accepted};
}
function adjustEconomics(economics={},assessment={}){const confidence=clamp(assessment.confidence,0,100);const freshnessKnown=assessment.freshnessKnown===true;const trust=freshnessKnown?.35+.65*(confidence/100):0;const profit=Number(economics.profit)||0;const roi=Number(economics.roi)||0;return{...economics,compConfidence:+confidence.toFixed(1),compFreshnessKnown:freshnessKnown,compFreshness:+clamp(freshnessKnown?assessment.freshnessScore:0,0,100).toFixed(1),compEconomicsAuthoritative:freshnessKnown,compTrust:+trust.toFixed(3),compAdjustedProfit:money(profit*trust),compAdjustedRoi:+(roi*trust).toFixed(1)};}
function fingerprint(retail={},comps=[],options={}){const a=assess(retail,comps,options);const bucket=Math.floor(a.confidence/10)*10;const freshBucket=Math.floor(a.freshnessScore/10)*10;return['comp',a.status,bucket,'f'+freshBucket,a.freshnessKnown?'dated':'undated',a.soldCount,a.freshSoldCount,a.staleSoldCount,a.askingCount,a.exactCount,a.rejected].join(':');}
return{sourceType,evidenceDate,recencyWeight,assess,adjustEconomics,fingerprint};
});