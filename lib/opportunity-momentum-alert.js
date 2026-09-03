(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQOpportunityMomentumAlert=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function gateMomentumAlert(alert={},momentum={}){
  const baseEligible=alert.alert===true||alert.eligible===true||alert.alertEligible===true;
  const blockers=[...(momentum.blockers||[])];
  const eligible=baseEligible&&momentum.alertEligible!==false&&!blockers.length;
  let priority=String(alert.priority||'standard').toLowerCase();
  if(!eligible)priority='digest';
  else if(Number(momentum.score)<70&&priority==='instant')priority='standard';
  return{...alert,alert:eligible,alertEligible:eligible,priority,momentumScore:Number(momentum.score)||0,momentumBlockers:blockers,reason:!baseEligible?'base alert gate failed':!eligible?'opportunity momentum gate failed':'opportunity momentum gate passed'};
}
return{gateMomentumAlert};
});