(function(root,factory){const api=factory(root.HuntIQAlerts);if(typeof module==='object'&&module.exports)module.exports=factory(require('./alerts'));else root.HuntIQConsensusAlerts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(alerts){
'use strict';
function shouldAlert(opportunity={},rules={}){
  const base=alerts.shouldAlert(opportunity,rules);const reasons=[...base.reasons];const c=opportunity.priceConsensus||null;
  const minConfidence=Number(rules.minPriceConsensusConfidence==null?55:rules.minPriceConsensusConfidence);
  const requireTwoSources=rules.requireTwoPriceSources===true;
  if(c){if(Number(c.confidence)<minConfidence)reasons.push('price-consensus');if(c.conflicting)reasons.push('price-conflict');if(requireTwoSources&&Number(c.sourceCount)<2)reasons.push('price-source-depth');}
  return{...base,alert:reasons.length===0,reasons,priceConsensus:c,priceConsensusRules:{minPriceConsensusConfidence:minConfidence,requireTwoPriceSources:requireTwoSources}};
}
function alertPriority(opportunity={}){const base=alerts.alertPriority(opportunity);const c=opportunity.priceConsensus;if(!c)return base;const trust=Math.max(0,Math.min(100,Number(c.confidence)||0));const conflictPenalty=c.conflicting?18:0;return Math.max(0,Math.min(100,Math.round(base*.9+trust*.1-conflictPenalty)));}
function fingerprint(opportunity={}){const c=opportunity.priceConsensus||{};const bucket=Number(c.confidence)>=85?'pc85':Number(c.confidence)>=65?'pc65':Number(c.confidence)>=45?'pc45':'pc0';return alerts.alertFingerprint(opportunity)+'|'+bucket+'|'+(c.conflicting?'conflict':'agree')+'|s'+(c.sourceCount||0);}
return{shouldAlert,alertPriority,fingerprint};
});