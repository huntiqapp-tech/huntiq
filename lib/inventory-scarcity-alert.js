(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQInventoryScarcityAlert=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const rank={digest:0,standard:1,instant:2};
function applyInventoryScarcityToAlert(baseAlert={},scarcity={}){
  const result={...baseAlert};
  let priority=String(result.priority||'digest').toLowerCase();
  if(!(priority in rank))priority='digest';
  if(result.alert!==true||scarcity.alertEligible===false){result.alert=false;result.priority='digest';result.scarcityReason=scarcity.alertEligible===false?'inventory-unavailable-or-unverified':'base-alert-ineligible';return result;}
  const scarcePriority=String(scarcity.alertPriority||'standard').toLowerCase();
  if(scarcePriority==='instant'&&rank[priority]>=rank.standard){priority='instant';result.scarcityReason='fresh-confirmed-inventory-is-selling-out';}
  else if(scarcePriority==='digest'){priority='digest';result.scarcityReason='inventory-signal-is-too-weak-or-stale-for-urgency';}
  result.priority=priority;
  return result;
}
return{applyInventoryScarcityToAlert};
});