(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQOpportunityConfidence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const num=v=>Number.isFinite(Number(v))?Number(v):null;
function scoreOpportunityConfidence(deal={}){
  const anomaly=deal.anomaly||{};const history=deal.historyAssessment||deal.history||{};const resale=deal.resale||{};const economics=deal.economics||{};const downside=deal.downsideEconomics||deal.downside||{};const alert=deal.alert||{};const agreement=deal.evidenceAgreement||null;const range=deal.opportunityRange||null;const execution=deal.executionConfidence||null;const halfLife=deal.opportunityHalfLife||null;
  const anomalyConfidence=clamp(deal.confidence==null?anomaly.confidence:deal.confidence);
  const historyCoverage=clamp(history.historyCoverageScore==null?history.confidence:history.historyCoverageScore);
  const resaleConfidence=clamp(resale.resaleConfidence);
  const liquidity=clamp(resale.liquidityScore);
  const soldCount=Math.max(0,Number(resale.soldCount)||0);
  const soldDepth=clamp((soldCount/20)*100);
  const roi=num(economics.roi),downsideRoi=num(downside.roi);
  const economicsStrength=clamp(roi==null?0:(roi>=60?100:roi<=0?0:(roi/60)*100));
  const downsideStrength=clamp(downsideRoi==null?0:(downsideRoi>=30?100:downsideRoi<=0?0:(downsideRoi/30)*100));
  const components={anomaly:anomalyConfidence,history:historyCoverage,resale:resaleConfidence,soldDepth,liquidity,economics:economicsStrength,downside:downsideStrength};
  if(agreement&&Number.isFinite(Number(agreement.score)))components.agreement=clamp(agreement.score);
  if(range&&range.conservative&&Number.isFinite(Number(range.conservative.roi)))components.conservativeRange=clamp(range.conservative.roi>=30?100:range.conservative.roi<=0?0:(range.conservative.roi/30)*100);
  if(execution&&Number.isFinite(Number(execution.score)))components.execution=clamp(execution.score);
  if(halfLife&&Number.isFinite(Number(halfLife.crossDomainMultiplier)))components.freshnessHalfLife=clamp(Number(halfLife.crossDomainMultiplier)*100);
  const weights={anomaly:.16,history:.16,resale:.18,soldDepth:.10,liquidity:.10,economics:.15,downside:.15};
  const weighted=Object.keys(weights).reduce((s,k)=>s+components[k]*weights[k],0);
  const weakest=Math.min(...Object.values(components));
  const imbalancePenalty=Math.max(0,(55-weakest)*0.35);
  let score=clamp(weighted-imbalancePenalty);
  const blockers=[];const cautions=[];
  if(historyCoverage<45)blockers.push('thin price history');
  if(resaleConfidence<45||soldCount<5)blockers.push('insufficient sold-market evidence');
  if(downsideRoi!=null&&downsideRoi<5)blockers.push('weak downside economics');
  if(anomalyConfidence<45)cautions.push('low anomaly confidence');
  if(liquidity<40)cautions.push('slow liquidity');
  if(agreement){const agreementScore=clamp(agreement.score);if((agreement.blockers||[]).length||agreementScore<60){blockers.push(...((agreement.blockers||[]).length?agreement.blockers:['cross-source evidence disagreement']));score=Math.min(score,59);}else if(agreementScore<80){cautions.push(...((agreement.cautions||[]).length?agreement.cautions:['mixed cross-source evidence']));score=Math.min(score,79);}}
  if(range){if((range.blockers||[]).length||range.alertEligible===false){blockers.push(...((range.blockers||[]).length?range.blockers:['conservative resale range failed']));score=Math.min(score,59);}else if((range.cautions||[]).length)cautions.push(...range.cautions);}
  if(execution){if((execution.blockers||[]).length||execution.alertEligible===false){blockers.push(...((execution.blockers||[]).length?execution.blockers:['execution confidence failed']));score=Math.min(score,59);}else if((execution.cautions||[]).length)cautions.push(...execution.cautions);}
  if(halfLife){if((halfLife.blockers||[]).length||halfLife.alertEligible===false){blockers.push(...((halfLife.blockers||[]).length?halfLife.blockers:['opportunity evidence expired']));score=Math.min(score,59);}else if(halfLife.alertState==='standard'||(halfLife.warnings||[]).length){cautions.push(...((halfLife.warnings||[]).length?halfLife.warnings:['opportunity evidence is aging']));score=Math.min(score,79);}}
  const origin=String(deal.dataOrigin||'').toLowerCase();
  if(origin==='demo'){score=Math.min(score,60);cautions.unshift('demonstration data');}
  const level=score>=80&&!blockers.length?'HIGH':score>=60?'MEDIUM':'LOW';
  const instantFresh=!halfLife||halfLife.alertState==='instant';
  const alertEligible=alert.alert===true&&level==='HIGH'&&!blockers.length&&origin!=='demo'&&(!agreement||agreement.alertEligible!==false)&&(!range||range.alertEligible!==false)&&(!execution||execution.alertEligible!==false)&&(!halfLife||halfLife.alertEligible!==false)&&instantFresh;
  return{score:Math.round(score),level,components,weakestComponent:Object.entries(components).sort((a,b)=>a[1]-b[1])[0][0],blockers:[...new Set(blockers)],cautions:[...new Set(cautions)],alertEligible,method:'weighted-evidence-with-agreement-range-execution-and-half-life-gates'};
}
return{scoreOpportunityConfidence};
});