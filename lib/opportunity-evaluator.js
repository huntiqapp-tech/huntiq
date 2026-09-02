(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('./resale-history'):root.HuntIQResaleHistory,
    typeof module==='object'&&module.exports?require('./channel-economics'):root.HuntIQChannels,
    typeof module==='object'&&module.exports?require('./evidence-gate'):root.HuntIQEvidenceGate,
    typeof module==='object'&&module.exports?require('./capital-velocity'):root.HuntIQCapitalVelocity
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQOpportunityEvaluator=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(ResaleHistory,Channels,EvidenceGate,CapitalVelocity){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function evaluateOpportunity({opportunity={},comparables=[],channels=[],history={},anomaly={},deal={},asOf}={}){
  if(!ResaleHistory||!Channels||!EvidenceGate||!CapitalVelocity)throw new Error('HUNTIQ evaluator dependencies unavailable');
  const resale=ResaleHistory.buildResaleHistory(comparables,{asOf});const preferredWindow=resale.windows['d'+resale.marketValueWindow]||resale.windows.d90;const preferredValue=Number(resale.marketValue)||0;const downsideValue=Number(preferredWindow&&preferredWindow.p25)||0;
  const confidenceAdjustedSalePrice=money(preferredValue*(.70+.30*clamp(resale.resaleConfidence,0,100)/100));
  const activeComparableCount=(comparables||[]).filter(c=>['active','listed','asking'].includes(String(c&&c.status||'').toLowerCase())).length;const resaleForEconomics={...resale,marketValue:preferredValue,resaleConfidence:resale.resaleConfidence,activeCount:activeComparableCount};const normalizedOpportunity={...opportunity,resale:resaleForEconomics};const normalizedChannels=(channels||[]).map(channel=>({...channel,salePrice:channel.salePrice==null?preferredValue:channel.salePrice,confidence:channel.confidence==null?resale.resaleConfidence:channel.confidence}));
  const comparison=Channels.compareChannels(normalizedOpportunity,normalizedChannels);let downsideComparison={best:null,channels:[]};if(downsideValue>0)downsideComparison=Channels.compareChannels(normalizedOpportunity,normalizedChannels.map(channel=>({...channel,salePrice:downsideValue})));
  let confidenceComparison={best:null,channels:[]};if(confidenceAdjustedSalePrice>0)confidenceComparison=Channels.compareChannels(normalizedOpportunity,normalizedChannels.map(channel=>({...channel,salePrice:confidenceAdjustedSalePrice})));
  const best=comparison.best;const downsideBest=downsideComparison.best;const confidenceBest=confidenceComparison.best;const economics=best?{...best,downsideSalePrice:money(downsideValue),downsideProfit:downsideBest?downsideBest.riskAdjustedProfit:0,downsideRoi:downsideBest?downsideBest.riskAdjustedRoi:0,confidenceAdjustedSalePrice,confidenceAdjustedProfit:confidenceBest?confidenceBest.riskAdjustedProfit:0,confidenceAdjustedRoi:confidenceBest?confidenceBest.riskAdjustedRoi:0}:{};
  const velocity=best?CapitalVelocity.evaluateCapitalVelocity({economics:best,resale:{estimatedDaysToSell:best.holdingDays||opportunity.holdingDays||30,soldCount90:resale.windows.d90.count,activeCount:activeComparableCount}}):CapitalVelocity.evaluateCapitalVelocity({});
  const evidence=EvidenceGate.evaluateEvidence({history,anomaly,resale:{confidence:resale.resaleConfidence,resaleConfidence:resale.resaleConfidence,soldCount90:resale.windows.d90.count,soldCount30:resale.windows.d30.count,priceIntegrity:resale.priceIntegrity,outlierCount:resale.outlierCount},economics,deal,liquidity:velocity});
  return{resale:{...resale,activeComparableCount},comparison,economics,velocity,evidence,downside:{salePrice:money(downsideValue),windowDays:resale.marketValueWindow,source:'preferred-window-p25'},confidenceAdjusted:{salePrice:confidenceAdjustedSalePrice,profit:confidenceBest?confidenceBest.riskAdjustedProfit:0,roi:confidenceBest?confidenceBest.riskAdjustedRoi:0,confidence:resale.resaleConfidence},recommendation:evidence.alertLevel==='instant'?'strong-buy':evidence.alertLevel==='standard'?'buy':evidence.alertLevel==='digest'?'watch':'skip'};
}
return{evaluateOpportunity};
});