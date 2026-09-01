(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('./resale-history'):root.HuntIQResaleHistory,
    typeof module==='object'&&module.exports?require('./channel-economics'):root.HuntIQChannels,
    typeof module==='object'&&module.exports?require('./evidence-gate'):root.HuntIQEvidenceGate
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQOpportunityEvaluator=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(ResaleHistory,Channels,EvidenceGate){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
function evaluateOpportunity({opportunity={},comparables=[],channels=[],history={},anomaly={},deal={},asOf}={}){
  if(!ResaleHistory||!Channels||!EvidenceGate)throw new Error('HUNTIQ evaluator dependencies unavailable');
  const resale=ResaleHistory.buildResaleHistory(comparables,{asOf});
  const preferredWindow=resale.windows['d'+resale.marketValueWindow]||resale.windows.d90;
  const preferredValue=Number(resale.marketValue)||0;
  const downsideValue=Number(preferredWindow&&preferredWindow.p25)||0;
  const resaleForEconomics={...resale,marketValue:preferredValue,resaleConfidence:resale.resaleConfidence};
  const normalizedOpportunity={...opportunity,resale:resaleForEconomics};
  const normalizedChannels=(channels||[]).map(channel=>({...channel,salePrice:channel.salePrice==null?preferredValue:channel.salePrice,confidence:channel.confidence==null?resale.resaleConfidence:channel.confidence}));
  const comparison=Channels.compareChannels(normalizedOpportunity,normalizedChannels);
  let downsideComparison={best:null,channels:[]};
  if(downsideValue>0){
    downsideComparison=Channels.compareChannels(normalizedOpportunity,normalizedChannels.map(channel=>({...channel,salePrice:downsideValue})));
  }
  const best=comparison.best;
  const downsideBest=downsideComparison.best;
  const economics=best?{...best,downsideSalePrice:money(downsideValue),downsideProfit:downsideBest?downsideBest.riskAdjustedProfit:0,downsideRoi:downsideBest?downsideBest.riskAdjustedRoi:0}:{};
  const evidence=EvidenceGate.evaluateEvidence({
    history,
    anomaly,
    resale:{confidence:resale.resaleConfidence,resaleConfidence:resale.resaleConfidence,soldCount90:resale.windows.d90.count,soldCount30:resale.windows.d30.count},
    economics,
    deal
  });
  return{
    resale,
    comparison,
    economics,
    evidence,
    downside:{salePrice:money(downsideValue),windowDays:resale.marketValueWindow,source:'preferred-window-p25'},
    recommendation:evidence.alertLevel==='instant'?'strong-buy':evidence.alertLevel==='standard'?'buy':evidence.alertLevel==='digest'?'watch':'skip'
  };
}
return{evaluateOpportunity};
});