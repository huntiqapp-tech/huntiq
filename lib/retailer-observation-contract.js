(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQRetailerObservationContract=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const REQUIRED=['retailer','sku','storeId','currentPrice','observedAt','source','sourceFamily'];
const RETENTION=['unrestricted','ephemeral','source-limited','unknown'];
const finite=v=>Number.isFinite(Number(v));
const text=v=>v==null?'':String(v).trim();
function validateRetailObservation(o={}){
  const errors=[];const warnings=[];
  for(const k of REQUIRED){if(k==='currentPrice'){if(!finite(o[k]))errors.push('missing-or-invalid:'+k);}else if(!text(o[k]))errors.push('missing:'+k);}
  if(finite(o.currentPrice)&&Number(o.currentPrice)<0)errors.push('negative-current-price');
  if(finite(o.regularPrice)&&Number(o.regularPrice)<0)errors.push('negative-regular-price');
  if(finite(o.regularPrice)&&finite(o.currentPrice)&&Number(o.regularPrice)>0&&Number(o.currentPrice)>Number(o.regularPrice)*3)warnings.push('current-price-far-above-reference');
  if(o.inventoryCount!=null&&(!finite(o.inventoryCount)||Number(o.inventoryCount)<0))errors.push('invalid-inventory-count');
  if(Number.isNaN(Date.parse(o.observedAt)))errors.push('invalid-observed-at');
  if(!text(o.sourceUrl))warnings.push('missing-source-url');
  if(!text(o.verificationState))warnings.push('missing-verification-state');
  const eq=Number(o.evidenceQuality);if(!Number.isFinite(eq)||eq<0||eq>1)errors.push('invalid-evidence-quality');
  const retention=text(o.retentionPolicy||'unknown').toLowerCase();if(!RETENTION.includes(retention))errors.push('invalid-retention-policy');
  if(retention==='unknown')warnings.push('retention-policy-unknown');
  const provenance={provider:text(o.provider||o.source),providerRecordId:text(o.providerRecordId),retrievedAt:o.retrievedAt||o.observedAt||null,retentionPolicy:retention,redistributionAllowed:o.redistributionAllowed===true};
  return{ok:errors.length===0,errors,warnings,provenance};
}
function observationIdentity(o={}){return[text(o.retailer).toLowerCase(),text(o.storeId).toLowerCase(),text(o.sku).toLowerCase()].join('::');}
function canPersistHistorically(o={}){const v=validateRetailObservation(o);if(!v.ok)return false;return v.provenance.retentionPolicy==='unrestricted'||v.provenance.retentionPolicy==='source-limited';}
function canRedistribute(o={}){const v=validateRetailObservation(o);return v.ok&&v.provenance.redistributionAllowed===true;}
return{REQUIRED,RETENTION,validateRetailObservation,observationIdentity,canPersistHistorically,canRedistribute};
});