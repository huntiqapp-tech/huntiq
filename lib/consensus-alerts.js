(function(root,factory){const api=factory(root.HuntIQAlerts);if(typeof module==='object'&&module.exports)module.exports=factory(require('./alerts'));else root.HuntIQConsensusAlerts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(alerts){
'use strict';
function marketRealityGate(opportunity={},rules={}){
  const m=opportunity.marketReality||null;const reasons=[];
  if(!m){if(rules.requireSoldMarketReality===true)reasons.push('sold-market-reality-missing');return{marketReality:null,reasons};}
  const acquisition=Number(m.acquisitionPrice);const sold=Number(m.soldMarketValue);const spread=Number(m.marketSpread);
  if(m.verdict==='sold-market-unknown'||!Number.isFinite(sold)||sold<=0)reasons.push('sold-market-unknown');
  else if(m.verdict==='above-sold-market'||m.verdict==='at-sold-market'||(Number.isFinite(acquisition)&&acquisition>=sold)||(Number.isFinite(spread)&&spread<=0))reasons.push('no-sold-market-edge');
  return{marketReality:m,reasons};
}
function historyIntegrityGate(opportunity={},rules={}){
  const h=opportunity.historyAssessment||opportunity.historyIntegrity||null;const reasons=[];const minIntegrity=Number(rules.minHistoryIntegrityScore==null?70:rules.minHistoryIntegrityScore);
  if(h&&Number.isFinite(Number(h.historyIntegrityScore))&&Number(h.historyIntegrityScore)<minIntegrity)reasons.push('history-reference-contamination');
  return{historyIntegrity:h,reasons,minHistoryIntegrityScore:minIntegrity};
}
function shouldAlert(opportunity={},rules={}){
  const base=alerts.shouldAlert(opportunity,rules);const reasons=[...base.reasons];const c=opportunity.priceConsensus||null;
  const minConfidence=Number(rules.minPriceConsensusConfidence==null?55:rules.minPriceConsensusConfidence);
  const requireTwoSources=rules.requireTwoPriceSources===true;
  if(c){if(Number(c.confidence)<minConfidence)reasons.push('price-consensus');if(c.conflicting)reasons.push('price-conflict');if(requireTwoSources&&Number(c.sourceCount)<2)reasons.push('price-source-depth');}
  const market=marketRealityGate(opportunity,rules);for(const reason of market.reasons)if(!reasons.includes(reason))reasons.push(reason);
  const history=historyIntegrityGate(opportunity,rules);for(const reason of history.reasons)if(!reasons.includes(reason))reasons.push(reason);
  return{...base,alert:reasons.length===0,reasons,priceConsensus:c,marketReality:market.marketReality,historyIntegrity:history.historyIntegrity,priceConsensusRules:{minPriceConsensusConfidence:minConfidence,requireTwoPriceSources:requireTwoSources,requireSoldMarketReality:rules.requireSoldMarketReality===true,minHistoryIntegrityScore:history.minHistoryIntegrityScore}};
}
function alertPriority(opportunity={}){const base=alerts.alertPriority(opportunity);const c=opportunity.priceConsensus;const m=marketRealityGate(opportunity,{});const h=historyIntegrityGate(opportunity,{});const marketPenalty=m.reasons.length?25:0;const historyPenalty=h.reasons.length?20:0;if(!c)return Math.max(0,base-marketPenalty-historyPenalty);const trust=Math.max(0,Math.min(100,Number(c.confidence)||0));const conflictPenalty=c.conflicting?18:0;return Math.max(0,Math.min(100,Math.round(base*.9+trust*.1-conflictPenalty-marketPenalty-historyPenalty)));}
function fingerprint(opportunity={}){const c=opportunity.priceConsensus||{};const bucket=Number(c.confidence)>=85?'pc85':Number(c.confidence)>=65?'pc65':Number(c.confidence)>=45?'pc45':'pc0';const m=opportunity.marketReality||{};const marketBucket=m.verdict||(!Number.isFinite(Number(m.soldMarketValue))?'sold-market-na':Number(m.marketSpread)>0?'sold-edge-positive':'sold-edge-nonpositive');const h=opportunity.historyAssessment||opportunity.historyIntegrity||{};const historyBucket=Number(h.historyIntegrityScore)>=90?'hi90':Number(h.historyIntegrityScore)>=70?'hi70':Number.isFinite(Number(h.historyIntegrityScore))?'hi0':'hi-na';return alerts.alertFingerprint(opportunity)+'|'+bucket+'|'+(c.conflicting?'conflict':'agree')+'|s'+(c.sourceCount||0)+'|'+marketBucket+'|'+historyBucket;}
return{marketRealityGate,historyIntegrityGate,shouldAlert,alertPriority,fingerprint};
});