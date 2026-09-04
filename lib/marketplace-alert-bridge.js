(function(root,factory){const api=factory(root.HuntIQAlerts,root.HuntIQPWAMarketplaceEconomics);if(typeof module==='object'&&module.exports){module.exports=factory(require('./alerts'),require('./pwa-marketplace-economics'));}else root.HuntIQMarketplaceAlertBridge=api;})(typeof globalThis!=='undefined'?globalThis:this,function(alerts,pwaEconomics){
'use strict';
if(!alerts||!pwaEconomics)return{};
const originalShouldAlert=alerts.shouldAlert.bind(alerts);
function shouldAlert(opportunity={},rules={}){const base=originalShouldAlert(opportunity,rules);const assessment=pwaEconomics.assessForOpportunity(opportunity,opportunity,{minNetProfit:rules.minProfit??50,minRoiPct:rules.minRoi??40});return pwaEconomics.applyAlertGate(base,assessment);}
alerts.shouldAlert=shouldAlert;
return{shouldAlert};
});