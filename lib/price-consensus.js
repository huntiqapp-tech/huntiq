(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQPriceConsensus=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const median=values=>{const a=(values||[]).map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
function normalizeSource(row={}){return String(row.source||row.sourceId||row.provider||row.channel||'unknown').trim().toLowerCase()||'unknown';}
function observedAt(row={}){for(const k of['observedAt','timestamp','capturedAt','updatedAt']){if(row[k]){const t=new Date(row[k]).getTime();if(Number.isFinite(t))return t;}}return null;}
function assess(observations=[],options={}){
  const now=Number(options.now||Date.now());const maxAgeHours=Math.max(1,Number(options.maxAgeHours||72));const tolerancePct=Math.max(.1,Number(options.tolerancePct||2.5));
  const rows=(observations||[]).map(o=>{const price=Number(o.price);const t=observedAt(o);const ageHours=t==null?null:Math.max(0,(now-t)/36e5);return{...o,price,source:normalizeSource(o),ageHours,valid:Number.isFinite(price)&&price>=0&&(ageHours==null||ageHours<=maxAgeHours)};});
  const valid=rows.filter(x=>x.valid);const prices=valid.map(x=>x.price);const center=median(prices);const sources=[...new Set(valid.map(x=>x.source))];const bySource={};for(const r of valid){if(!bySource[r.source])bySource[r.source]=[];bySource[r.source].push(r.price);}
  const sourceMedians=Object.entries(bySource).map(([source,vals])=>({source,price:median(vals)}));
  const agreementCount=center==null?0:sourceMedians.filter(x=>Math.abs(x.price-center)/Math.max(center,.01)*100<=tolerancePct).length;
  const sourceAgreement=sources.length?agreementCount/sources.length:0;
  const spreadPct=center>0&&sourceMedians.length>1?((Math.max(...sourceMedians.map(x=>x.price))-Math.min(...sourceMedians.map(x=>x.price)))/center)*100:0;
  const freshness=valid.length?valid.reduce((s,x)=>s+(x.ageHours==null?.7:Math.pow(.5,x.ageHours/24)),0)/valid.length:0;
  const diversity=clamp(sources.length/3,0,1);const volume=clamp(valid.length/5,0,1);const spreadPenalty=clamp(spreadPct/20,0,1);
  const confidence=Math.round(clamp(100*(.42*sourceAgreement+.24*diversity+.18*volume+.16*freshness-.22*spreadPenalty),0,100));
  let status='weak';if(confidence>=85&&sources.length>=2)status='strong';else if(confidence>=65)status='moderate';else if(confidence>=45)status='thin';
  const conflicting=sources.length>=2&&spreadPct>Math.max(5,tolerancePct*2);
  return{total:rows.length,validCount:valid.length,sourceCount:sources.length,sources,medianPrice:center==null?null:+center.toFixed(2),sourceAgreement:+(sourceAgreement*100).toFixed(1),spreadPct:+spreadPct.toFixed(1),freshnessScore:+(freshness*100).toFixed(1),confidence,status,conflicting,staleOrInvalidCount:rows.length-valid.length,sourceMedians};
}
function adjustEconomics(economics={},consensus={}){const confidence=clamp(consensus.confidence,0,100);const conflictPenalty=consensus.conflicting?.72:1;const trust=(.45+.55*(confidence/100))*conflictPenalty;const profit=Number(economics.profit)||0;const roi=Number(economics.roi)||0;return{...economics,priceConsensusConfidence:+confidence.toFixed(1),priceConsensusTrust:+trust.toFixed(3),consensusAdjustedProfit:+(profit*trust).toFixed(2),consensusAdjustedRoi:+(roi*trust).toFixed(1)};}
function applyToOpportunity(opportunity={},observations=[],options={}){const consensus=assess(observations,options);const evidence=opportunity.evidenceQuality==null?1:Number(opportunity.evidenceQuality);const multiplier=.55+.45*(consensus.confidence/100);const economics=opportunity.economics?adjustEconomics(opportunity.economics,consensus):opportunity.economics;const downsideEconomics=opportunity.downsideEconomics?adjustEconomics(opportunity.downsideEconomics,consensus):opportunity.downsideEconomics;return{...opportunity,priceConsensus:consensus,evidenceQuality:+clamp(evidence*multiplier,0,1).toFixed(3),economics,downsideEconomics};}
function fingerprint(consensus={}){const c=Number(consensus.confidence)||0;const b=c>=85?'c85':c>=65?'c65':c>=45?'c45':'c0';const a=Number(consensus.sourceAgreement)||0;const ab=a>=90?'a90':a>=70?'a70':a>=50?'a50':'a0';return['price',b,ab,consensus.sourceCount||0,consensus.conflicting?'conflict':'ok',consensus.medianPrice==null?'na':consensus.medianPrice].join(':');}
return{median,normalizeSource,observedAt,assess,adjustEconomics,applyToOpportunity,fingerprint};
});