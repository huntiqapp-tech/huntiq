(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQMultiBuyPromotions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function normalizeUnits(items=[]){const units=[];(Array.isArray(items)?items:[]).forEach((item,index)=>{const quantity=Math.max(0,Math.floor(Number(item&&item.quantity==null?1:item.quantity)||0));const unitPrice=Math.max(0,Number(item&&item.unitPrice==null?item&&item.price:item.unitPrice)||0);const id=String(item&&item.id!=null?item.id:index);const offerGroup=String(item&&item.offerGroup!=null?item.offerGroup:'default');for(let i=0;i<quantity;i++)units.push({id,unitIndex:i,unitPrice:money(unitPrice),eligible:item&&item.eligible!==false,offerGroup});});return units;}
function explicitLimit(input){const raw=input.maxRedemptions==null?input.redemptionLimit:input.maxRedemptions;if(raw==null||raw==='')return null;return Math.max(0,Math.floor(Number(raw)||0));}
function limitPolicy(input,available){const explicit=explicitLimit(input);const unknown=explicit==null&&(input.limitMayApply===true||input.redemptionLimitKnown===false||input.redemptionLimitUnknown===true);if(explicit!=null)return{known:true,limit:explicit,applied:Math.min(available,explicit),guaranteed:Math.min(available,explicit),uncertain:0};if(!unknown)return{known:true,limit:null,applied:available,guaranteed:available,uncertain:0};const guaranteed=Math.min(available,Math.max(1,Math.floor(Number(input.guaranteedRedemptions)||1)));return{known:false,limit:null,applied:guaranteed,guaranteed,uncertain:Math.max(0,available-guaranteed)};}
function evaluateMultiBuyPromotion(input={}){
  const type=String(input.type||input.promotionType||'').toLowerCase();
  const currentItemId=input.currentItemId==null?null:String(input.currentItemId);
  const basketComplete=input.basketComplete===true;
  const mixAndMatch=input.mixAndMatch!==false;
  const units=normalizeUnits(input.items);
  const eligibleUnits=units.filter(u=>u.eligible&&u.unitPrice>0);
  const reasons=[];const warnings=[];const discounts=[];
  if(!basketComplete)reasons.push('multibuy-basket-completeness-unconfirmed');
  if(!units.length)reasons.push('multibuy-items-missing');
  if(currentItemId!=null&&!units.some(u=>u.id===currentItemId))reasons.push('current-item-not-in-multibuy-basket');
  if(!['buy-x-get-y','cheapest-item-free','quantity-tier'].includes(type))reasons.push('unsupported-multibuy-type');
  const groups=mixAndMatch?{all:eligibleUnits}:eligibleUnits.reduce((acc,u)=>{(acc[u.offerGroup]||(acc[u.offerGroup]=[])).push(u);return acc;},{});
  let availableRedemptions=0;let appliedRedemptions=0;let policy={known:true,limit:null,applied:0,guaranteed:0,uncertain:0};
  if(type==='buy-x-get-y'){
    const buy=Math.max(1,Math.floor(Number(input.buyQuantity)||0));const get=Math.max(1,Math.floor(Number(input.getQuantity)||0));
    if(!(Number(input.buyQuantity)>0)||!(Number(input.getQuantity)>0))reasons.push('multibuy-quantity-rule-missing');
    if(!reasons.length){Object.values(groups).forEach(group=>{availableRedemptions+=Math.floor(group.length/(buy+get));});policy=limitPolicy(input,availableRedemptions);appliedRedemptions=policy.applied;let remaining=appliedRedemptions;Object.values(groups).sort((a,b)=>Math.min(...a.map(x=>x.unitPrice))-Math.min(...b.map(x=>x.unitPrice))).forEach(group=>{if(remaining<=0)return;const n=Math.min(remaining,Math.floor(group.length/(buy+get)));if(n>0){const sorted=[...group].sort((a,b)=>a.unitPrice-b.unitPrice);for(let i=0;i<n*get;i++)discounts.push({...sorted[i],discount:sorted[i].unitPrice});remaining-=n;}});if(availableRedemptions<1)reasons.push('multibuy-quantity-not-met');}
  }
  if(type==='cheapest-item-free'){
    const required=Math.max(2,Math.floor(Number(input.requiredQuantity)||2));
    if(!reasons.length){Object.values(groups).forEach(group=>{availableRedemptions+=Math.floor(group.length/required);});policy=limitPolicy(input,availableRedemptions);appliedRedemptions=policy.applied;let remaining=appliedRedemptions;Object.values(groups).sort((a,b)=>Math.min(...a.map(x=>x.unitPrice))-Math.min(...b.map(x=>x.unitPrice))).forEach(group=>{if(remaining<=0)return;const n=Math.min(remaining,Math.floor(group.length/required));if(n>0){const sorted=[...group].sort((a,b)=>a.unitPrice-b.unitPrice);for(let i=0;i<n;i++)discounts.push({...sorted[i],discount:sorted[i].unitPrice});remaining-=n;}});if(availableRedemptions<1)reasons.push('multibuy-quantity-not-met');}
  }
  if(type==='quantity-tier'){
    const required=Math.max(1,Math.floor(Number(input.requiredQuantity)||0));const percent=clamp(input.discountPercent,0,100);const fixed=Math.max(0,Number(input.discountPerUnit)||0);
    if(!(Number(input.requiredQuantity)>0))reasons.push('multibuy-quantity-rule-missing');if(percent<=0&&fixed<=0)reasons.push('multibuy-discount-missing');
    if(!reasons.length){const qualifyingGroups=Object.values(groups).filter(group=>group.length>=required);availableRedemptions=qualifyingGroups.length;policy=limitPolicy(input,availableRedemptions);appliedRedemptions=policy.applied;if(!qualifyingGroups.length)reasons.push('multibuy-quantity-not-met');else qualifyingGroups.slice(0,appliedRedemptions).forEach(group=>group.forEach(u=>{const discount=percent>0?u.unitPrice*(percent/100):Math.min(u.unitPrice,fixed);discounts.push({...u,discount:money(discount)});}));}
  }
  const baseEligible=reasons.length===0;const limitUncertain=baseEligible&&!policy.known&&policy.uncertain>0;const itemDiscounts={};let totalDiscount=0;
  if(baseEligible){discounts.forEach(d=>{const value=money(Math.min(d.unitPrice,d.discount));itemDiscounts[d.id]=money((itemDiscounts[d.id]||0)+value);totalDiscount+=value;});totalDiscount=money(totalDiscount);}
  const currentItemDiscount=currentItemId==null?0:money(itemDiscounts[currentItemId]||0);const currentItemSpend=money(eligibleUnits.filter(u=>u.id===currentItemId).reduce((sum,u)=>sum+u.unitPrice,0));const currentItemQuantity=eligibleUnits.filter(u=>u.id===currentItemId).length;const currentItemEffectiveCost=money(Math.max(0,currentItemSpend-currentItemDiscount));
  if(limitUncertain)reasons.push('multibuy-redemption-limit-unknown');
  const eligible=baseEligible&&!limitUncertain;const status=!baseEligible?(reasons.some(r=>r.includes('unconfirmed'))?'unknown':'ineligible'):(limitUncertain?'unknown':'eligible');
  if(baseEligible&&totalDiscount>0)warnings.push('Multi-buy savings require purchasing the full qualifying quantity.');
  if(baseEligible&&policy.known&&availableRedemptions>appliedRedemptions)warnings.push('Promotion redemption limit capped the available multi-buy savings.');
  if(limitUncertain)warnings.push('Retailer says a redemption limit may apply; HUNTIQ records only the guaranteed redemption count but excludes unverified multi-buy savings from deal ROI and Instant alerts until the cap is confirmed.');
  if(!mixAndMatch)warnings.push('Promotion does not allow mix-and-match across offer groups.');
  return{type,status,eligible,basketComplete,mixAndMatch,unitCount:units.length,eligibleUnitCount:eligibleUnits.length,totalDiscount:money(totalDiscount),itemDiscounts,currentItemId,currentItemDiscount,currentItemSpend,currentItemEffectiveCost,currentItemEffectiveUnitCost:money(currentItemSpend>0?currentItemEffectiveCost/Math.max(1,currentItemQuantity):0),availableRedemptions,appliedRedemptions,redemptionLimit:explicitLimit(input),redemptionLimitKnown:policy.known,guaranteedRedemptions:policy.guaranteed,uncertainRedemptions:policy.uncertain,limitUncertain,reasons,warnings,units};
}
return{normalizeUnits,evaluateMultiBuyPromotion};
});