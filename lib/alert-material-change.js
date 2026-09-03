(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAlertMaterialChange=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const round=(v,d=2)=>+n(v).toFixed(d);
const pct=(current,previous)=>previous>0?((current-previous)/previous)*100:0;
const absPct=(current,previous)=>Math.abs(pct(current,previous));
function assessMaterialChange({candidate={},previous={},threshold=1}={}){
  const currentAnomaly=n(candidate.anomalyScore??candidate.anomalyConfidence);
  const previousAnomaly=n(previous.anomalyScore??previous.anomalyConfidence);
  const currentHistoryDepth=n(candidate.historySampleCount??candidate.priceHistorySamples);
  const previousHistoryDepth=n(previous.historySampleCount??previous.priceHistorySamples);
  const currentResaleEvidence=n(candidate.resaleEffectiveWeight??candidate.effectiveEvidenceWeight);
  const previousResaleEvidence=n(previous.resaleEffectiveWeight??previous.effectiveEvidenceWeight);
  const metrics={
    priceDropPct: previous.price>0&&candidate.price>0?Math.max(0,-pct(n(candidate.price),n(previous.price))):0,
    profitChangePct: absPct(n(candidate.profit??candidate.riskAdjustedProfit),n(previous.profit??previous.riskAdjustedProfit)),
    roiChangePct: absPct(n(candidate.roi??candidate.riskAdjustedRoi),n(previous.roi??previous.riskAdjustedRoi)),
    confidenceChange: Math.abs(n(candidate.confidence??candidate.evidenceConfidence)-n(previous.confidence??previous.evidenceConfidence)),
    anomalyScoreChange:Math.abs(currentAnomaly-previousAnomaly),
    historyDepthChange:Math.abs(currentHistoryDepth-previousHistoryDepth),
    resaleChangePct: absPct(n(candidate.resaleMedian??candidate.marketValue),n(previous.resaleMedian??previous.marketValue)),
    resaleEvidenceChangePct:absPct(currentResaleEvidence,previousResaleEvidence),
    quantityChange: Math.abs(n(candidate.recommendedQuantity)-n(previous.recommendedQuantity)),
    inventoryChange: Math.abs(n(candidate.availableQuantity??candidate.inventory)-n(previous.availableQuantity??previous.inventory))
  };
  const points={
    price:Math.min(1,metrics.priceDropPct/3),
    profit:Math.min(1,metrics.profitChangePct/10),
    roi:Math.min(1,metrics.roiChangePct/12),
    confidence:Math.min(1,metrics.confidenceChange/0.08),
    anomaly:Math.min(1,metrics.anomalyScoreChange/0.08),
    history:Math.min(1,metrics.historyDepthChange/5),
    resale:Math.min(1,metrics.resaleChangePct/8),
    resaleEvidence:Math.min(1,metrics.resaleEvidenceChangePct/25),
    quantity:Math.min(1,metrics.quantityChange/1),
    inventory:Math.min(1,metrics.inventoryChange/2)
  };
  const score=points.price*0.20+points.profit*0.15+points.roi*0.12+points.confidence*0.12+points.anomaly*0.08+points.history*0.05+points.resale*0.08+points.resaleEvidence*0.06+points.quantity*0.08+points.inventory*0.06;
  const levelChanged=String(candidate.alertLevel||candidate.priority||'').toLowerCase()!==String(previous.alertLevel||previous.priority||'').toLowerCase();
  const eligibilityChanged=Boolean(candidate.alertEligible)!==Boolean(previous.alertEligible);
  const reasons=[];
  if(metrics.priceDropPct>=3)reasons.push('price-drop');
  if(metrics.profitChangePct>=10)reasons.push('profit-change');
  if(metrics.roiChangePct>=12)reasons.push('roi-change');
  if(metrics.confidenceChange>=0.08)reasons.push('confidence-change');
  if(metrics.anomalyScoreChange>=0.08)reasons.push('anomaly-score-change');
  if(metrics.historyDepthChange>=5)reasons.push('price-history-depth-change');
  if(metrics.resaleChangePct>=8)reasons.push('resale-change');
  if(previousResaleEvidence>0&&metrics.resaleEvidenceChangePct>=25)reasons.push('resale-evidence-change');
  if(metrics.quantityChange>=1)reasons.push('recommended-quantity-change');
  if(metrics.inventoryChange>=2)reasons.push('inventory-change');
  if(levelChanged)reasons.push('alert-level-change');
  if(eligibilityChanged)reasons.push('eligibility-change');
  const hardTrigger=reasons.length>0;
  const materiallyChanged=hardTrigger||score>=threshold||Boolean(candidate.forceAlert);
  return{materiallyChanged,score:round(score,3),reasons,metrics:Object.fromEntries(Object.entries(metrics).map(([k,v])=>[k,round(v,3)]))};
}
function decideRepeatAlert({candidate={},previous=null,asOf=new Date().toISOString(),cooldownMinutes=180,reminderHours=24,threshold=1}={}){
  if(candidate.alertEligible===false)return{send:false,reason:'not-eligible'};
  if(!previous)return{send:true,reason:'first-alert',materialChange:null};
  const ageMinutes=Math.max(0,(new Date(asOf)-new Date(previous.sentAt||previous.createdAt||asOf))/60000);
  const materialChange=assessMaterialChange({candidate,previous,threshold});
  if(materialChange.materiallyChanged)return{send:true,reason:'material-change',ageMinutes:round(ageMinutes,1),materialChange};
  if(ageMinutes<cooldownMinutes)return{send:false,reason:'cooldown',ageMinutes:round(ageMinutes,1),materialChange};
  if(ageMinutes<reminderHours*60)return{send:false,reason:'unchanged-after-cooldown',ageMinutes:round(ageMinutes,1),materialChange};
  return{send:true,reason:'long-window-reminder',ageMinutes:round(ageMinutes,1),materialChange};
}
return{assessMaterialChange,decideRepeatAlert};
});