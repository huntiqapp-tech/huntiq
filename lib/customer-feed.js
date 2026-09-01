(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQCustomerFeed=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function rankOpportunity({health={},presentation={},deal={},evidence={}}={}){
  const score=clamp(health.score,0,99);
  const state=health.state||presentation.state||'WATCH';
  const freshness=clamp(((health.components||{}).freshness),0,100);
  const resale=clamp(((health.components||{}).resale),0,100);
  const history=clamp(((health.components||{}).history),0,100);
  const roi=clamp(((health.components||{}).riskAdjustedRoi),0,100);
  const evidenceScore=evidence.evidenceScore==null?null:clamp(evidence.evidenceScore,0,100);
  const verified=(presentation.badges||[]).includes('Verified')||Boolean(deal.verified);
  let priority=score*0.55+freshness*0.15+resale*0.1+history*0.08+roi*0.12;
  if(evidenceScore!=null)priority=priority*.75+evidenceScore*.25;
  if(state==='BUY-READY')priority+=8;
  if(state==='WATCH')priority-=8;
  if(state==='BLOCKED')priority=0;
  if(verified)priority+=3;
  if((health.watchReasons||[]).includes('thin-price-history'))priority=Math.min(priority,64);
  if((health.blockers||[]).length)priority=0;
  if(evidence.alertLevel==='suppressed'||(evidence.blockers||[]).length)priority=0;
  if(evidence.confidenceBand==='low')priority=Math.min(priority,55);
  return Math.round(clamp(priority,0,99));
}
function buildFeed(items=[]){
  const ranked=items.map(item=>({...item,feedPriority:rankOpportunity(item)}));
  ranked.sort((a,b)=>b.feedPriority-a.feedPriority||((b.health||{}).score||0)-((a.health||{}).score||0));
  return{
    topPicks:ranked.filter(x=>(x.health||{}).state==='BUY-READY'&&x.feedPriority>=72&&((x.evidence||{}).alertLevel!=='suppressed')),
    watch:ranked.filter(x=>(x.health||{}).state==='WATCH'||((x.evidence||{}).confidenceBand==='low'&&x.feedPriority>0)),
    blocked:ranked.filter(x=>(x.health||{}).state==='BLOCKED'||(x.evidence||{}).alertLevel==='suppressed'),
    all:ranked
  };
}
return{rankOpportunity,buildFeed};
});