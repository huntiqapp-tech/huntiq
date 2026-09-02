(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQEvidenceAdjustments=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function applyConcentrationStress({profit=0,roi=0,alertLevel='instant',concentrationScore=100}={}){
 const score=clamp(concentrationScore,0,100);const factor=.65+.35*(score/100);const adjustedProfit=+(Number(profit||0)*factor).toFixed(2);const adjustedRoi=+(Number(roi||0)*factor).toFixed(1);
 let adjustedAlertLevel=alertLevel;if(score<50)adjustedAlertLevel='none';else if(score<70&&alertLevel==='instant')adjustedAlertLevel='digest';else if(score<85&&alertLevel==='instant')adjustedAlertLevel='standard';
 return{concentrationScore:score,factor:+factor.toFixed(3),adjustedProfit,adjustedRoi,adjustedAlertLevel};
}
return{applyConcentrationStress};
});