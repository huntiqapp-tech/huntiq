(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQEvidenceAgreement=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const median=values=>{const a=values.filter(v=>finite(v)!=null).map(Number).sort((a,b)=>a-b);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
const spreadPct=values=>{const a=values.filter(v=>finite(v)!=null&&Number(v)>0).map(Number);if(a.length<2)return 0;const med=median(a);return med?((Math.max(...a)-Math.min(...a))/med)*100:100;};
function scoreEvidenceAgreement(input={}){
  const retailerPrices=(input.retailerPrices||[]).filter(v=>finite(v)!=null&&Number(v)>0).map(Number);
  const resaleEstimates=(input.resaleEstimates||[]).filter(v=>finite(v)!=null&&Number(v)>0).map(Number);
  const roiScenarios=(input.roiScenarios||[]).filter(v=>finite(v)!=null).map(Number);
  const retailerSpread=spreadPct(retailerPrices);const resaleSpread=spreadPct(resaleEstimates);const roiMedian=median(roiScenarios);
  const roiSpread=roiScenarios.length<2?0:(Math.max(...roiScenarios)-Math.min(...roiScenarios));
  const retailerScore=retailerPrices.length<2?100:clamp(100-retailerSpread*2.2);
  const resaleScore=resaleEstimates.length<2?100:clamp(100-resaleSpread*1.8);
  const roiScore=roiScenarios.length<2?100:clamp(100-Math.max(0,roiSpread)*1.1);
  let score=Math.round(retailerScore*.4+resaleScore*.35+roiScore*.25);
  const blockers=[];const cautions=[];
  if(retailerPrices.length>=2&&retailerSpread>20)blockers.push('retailer price disagreement');
  else if(retailerPrices.length>=2&&retailerSpread>10)cautions.push('retailer prices differ materially');
  if(resaleEstimates.length>=2&&resaleSpread>30)blockers.push('resale-source disagreement');
  else if(resaleEstimates.length>=2&&resaleSpread>15)cautions.push('resale estimates vary by source');
  if(roiScenarios.length>=2&&Math.min(...roiScenarios)<0&&Math.max(...roiScenarios)>20)blockers.push('profit outcome disagreement');
  else if(roiScenarios.length>=2&&roiSpread>25)cautions.push('ROI is scenario-sensitive');
  if(blockers.length)score=Math.min(score,59);
  const level=score>=80&&!blockers.length?'HIGH':score>=60?'MEDIUM':'LOW';
  return{score,level,components:{retailer:Math.round(retailerScore),resale:Math.round(resaleScore),roi:Math.round(roiScore)},retailerSpreadPct:Number(retailerSpread.toFixed(2)),resaleSpreadPct:Number(resaleSpread.toFixed(2)),roiSpread:Number(roiSpread.toFixed(2)),roiMedian:roiMedian==null?null:Number(roiMedian.toFixed(2)),blockers,cautions,alertEligible:level==='HIGH'&&!blockers.length,method:'cross-source-spread-agreement'};
}
return{scoreEvidenceAgreement,spreadPct,median};
});