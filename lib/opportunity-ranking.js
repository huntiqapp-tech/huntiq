(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQOpportunityRanking=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,finite(v)));

  function bestOpportunityScore(opportunity={}){
    const profit=Math.max(0,finite(opportunity.profit ?? opportunity.economics?.profit));
    const roi=Math.max(0,finite(opportunity.roi ?? opportunity.economics?.roi));
    const downsideRoi=finite(opportunity.downsideEconomics?.roi,roi);
    const confidence=clamp(opportunity.opportunityConfidence?.score ?? opportunity.confidence ?? opportunity.anomaly?.confidence);
    const liquidity=clamp(opportunity.resale?.liquidityScore);
    const execution=clamp(opportunity.executionConfidence?.score ?? opportunity.execution?.score ?? 100);
    const evidenceAgreement=clamp(opportunity.evidenceAgreement?.score ?? 100);
    const freshness=clamp(opportunity.opportunityHalfLife?.evidenceStrengthRemainingPct ?? opportunity.freshness?.score ?? 100);
    const discount=clamp(opportunity.anomaly?.dropPct);
    const capitalScore=clamp(opportunity.capitalEfficiency?.score);

    // Profit/ROI are capped so one extreme number cannot overwhelm weak evidence.
    const profitScore=clamp((Math.log10(1+profit)/Math.log10(501))*100);
    const roiScore=clamp((Math.min(roi,200)/200)*100);
    const downsideScore=clamp((Math.max(0,Math.min(downsideRoi,100))/100)*100);
    const discountScore=clamp((Math.min(discount,80)/80)*100);

    const weighted=(
      confidence*0.22 +
      profitScore*0.18 +
      roiScore*0.14 +
      downsideScore*0.12 +
      liquidity*0.10 +
      execution*0.08 +
      evidenceAgreement*0.06 +
      freshness*0.04 +
      capitalScore*0.04 +
      discountScore*0.02
    );

    const weakest=Math.min(confidence,execution,evidenceAgreement,freshness);
    const weakLinkPenalty=weakest<40?(40-weakest)*0.55:0;
    return Math.round(clamp(weighted-weakLinkPenalty)*10)/10;
  }

  function sortValue(opportunity,mode){
    switch(mode){
      case 'discount': return finite(opportunity.anomaly?.dropPct);
      case 'profit': return finite(opportunity.profit ?? opportunity.economics?.profit);
      case 'roi': return finite(opportunity.roi ?? opportunity.economics?.roi);
      case 'fastest': return -finite(opportunity.capitalEfficiency?.estimatedDaysToSell ?? opportunity.resale?.estimatedDaysToSell,9999);
      case 'newest': return Date.parse(opportunity.observedAt||opportunity.timestamp||0)||0;
      default: return bestOpportunityScore(opportunity);
    }
  }

  function rank(opportunities=[],mode='best'){
    return [...opportunities].sort((a,b)=>{
      const delta=sortValue(b,mode)-sortValue(a,mode);
      if(delta) return delta;
      return bestOpportunityScore(b)-bestOpportunityScore(a);
    });
  }

  return {bestOpportunityScore,rank,sortValue};
});
