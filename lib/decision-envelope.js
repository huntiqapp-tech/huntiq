(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDecisionEnvelope=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,Number(n)||0));
const round=(n,d=1)=>+((Number(n)||0).toFixed(d));
function assessDecisionEnvelope(input={}){
  const anomaly=clamp(input.anomalyConfidence??input.rarityAdjustedAnomaly??50);
  const resale=clamp(input.resaleConfidence??50);
  const evidence=clamp(input.evidenceConfidence??50);
  const liquidity=clamp(input.liquidityScore??50);
  const execution=clamp(input.executionConfidence??50);
  const profit=Number(input.profit)||0;
  const roi=Number(input.roi)||0;
  const downsideProfit=Number(input.downsideProfit??profit)||0;
  const downsideRoi=Number(input.downsideRoi??roi)||0;
  const agreement=Math.min(anomaly,resale,evidence,execution);
  const confidence=clamp(anomaly*.24+resale*.22+evidence*.20+liquidity*.14+execution*.20);
  const uncertaintyHaircut=clamp((100-confidence)*.0035,0,.35);
  const conservativeProfit=profit*(1-uncertaintyHaircut);
  const conservativeRoi=roi*(1-uncertaintyHaircut);
  const downsidePositive=downsideProfit>0&&downsideRoi>0;
  const economicsPositive=conservativeProfit>0&&conservativeRoi>0;
  const blocked=!economicsPositive||!downsidePositive||agreement<25;
  let verdict='watch';
  if(blocked)verdict='skip';
  else if(confidence>=78&&conservativeRoi>=40&&conservativeProfit>=40)verdict='buy';
  else if(confidence>=60&&conservativeRoi>=20&&conservativeProfit>=20)verdict='watch-closely';
  let alertAction='digest';
  if(!blocked&&verdict==='buy'&&confidence>=82&&liquidity>=55)alertAction='instant';
  else if(!blocked&&confidence>=60&&economicsPositive)alertAction='standard';
  const reasons=[];
  if(anomaly<50)reasons.push('weak-anomaly-confidence');
  if(resale<50)reasons.push('weak-resale-confidence');
  if(evidence<50)reasons.push('weak-evidence-confidence');
  if(liquidity<40)reasons.push('slow-liquidity');
  if(execution<50)reasons.push('weak-execution-confidence');
  if(!downsidePositive)reasons.push('negative-downside-economics');
  if(!economicsPositive)reasons.push('negative-confidence-adjusted-economics');
  if(agreement<25)reasons.push('cross-signal-disagreement');
  return {confidence:Math.round(confidence),agreementFloor:Math.round(agreement),uncertaintyHaircutPct:round(uncertaintyHaircut*100),conservativeProfit:round(conservativeProfit,2),conservativeRoi:round(conservativeRoi),downsideProfit:round(downsideProfit,2),downsideRoi:round(downsideRoi),blocked,verdict,alertAction,reasons};
}
function compareDecisionEnvelopes(opportunities=[]){const ranked=(opportunities||[]).map(o=>({...o,decisionEnvelope:assessDecisionEnvelope(o)})).sort((a,b)=>{const x=a.decisionEnvelope,y=b.decisionEnvelope;return Number(x.blocked)-Number(y.blocked)||y.confidence-x.confidence||y.conservativeProfit-x.conservativeProfit||y.conservativeRoi-x.conservativeRoi;});return {best:ranked[0]||null,opportunities:ranked};}
return {assessDecisionEnvelope,compareDecisionEnvelopes};
});