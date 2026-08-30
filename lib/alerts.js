(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAlerts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const defaults={minFlipScore:75,minProfit:50,minRoi:40,minAnomalyConfidence:65};
function shouldAlert(opportunity={},rules={}){const r={...defaults,...rules};const econ=opportunity.economics||{};const anomaly=opportunity.anomaly||{};const reasons=[];if(Number(opportunity.flipScore)<r.minFlipScore)reasons.push('flip-score');if(Number(econ.profit)<r.minProfit)reasons.push('profit');if(Number(econ.roi)<r.minRoi)reasons.push('roi');if(Number(anomaly.confidence)<r.minAnomalyConfidence)reasons.push('anomaly-confidence');return{alert:reasons.length===0,reasons,rules:r};}
function alertFingerprint(opportunity={}){const parts=[opportunity.retailer,opportunity.sku||opportunity.id,opportunity.storeId||'online',opportunity.price,opportunity.anomaly&&opportunity.anomaly.label].map(v=>String(v==null?'':v));return parts.join('|');}
function rankAlerts(opportunities=[],rules={}){return opportunities.map(o=>({opportunity:o,decision:shouldAlert(o,rules)})).filter(x=>x.decision.alert).sort((a,b)=>(b.opportunity.flipScore||0)-(a.opportunity.flipScore||0));}
return{defaults,shouldAlert,alertFingerprint,rankAlerts};
});