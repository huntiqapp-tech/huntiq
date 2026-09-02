(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQMultiBuyPromotions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function normalizeUnits(items=[]){const units=[];(Array.isArray(items)?items:[]).forEach((item,index)=>{const quantity=Math.max(0,Math.floor(Number(item&&item.quantity==null?1:item.quantity)||0));const unitPrice=Math.max(0,Number(item&&item.unitPrice==null?item&&item.price:item.unitPrice)||0);const id=String(item&&item.id!=null?item.id:index);for(let i=0;i<quantity;i++)units.push({id,unitIndex:i,unitPrice:money(unitPrice),eligible:item&&item.eligible!==false});});return units;}
function evaluateMultiBuyPromotion(input={}){
  const type=String(input.type||input.promotionType||'').toLowerCase();
  const currentItemId=input.currentItemId==null?null:String(input.currentItemId);
  const basketComplete=input.basketComplete===true;
  const units=normalizeUnits(input.items);
  const eligibleUnits=units.filter(u=>u.eligible&&u.unitPrice>0);
  const reasons=[];const warnings=[];const discounts=[];
  if(!basketComplete)reasons.push('multibuy-basket-completeness-unconfirmed');
  if(!units.length)reasons.push('multibuy-items-missing');
  if(currentItemId!=null&&!units.some(u=>u.id===currentItemId))reasons.push('current-item-not-in-multibuy-basket');
  if(!['buy-x-get-y','cheapest-item-free','quantity-tier'].includes(type))reasons.push('unsupported-multibuy-type');
  if(type==='buy-x-get-y'){
    const buy=Math.max(1,Math.floor(Number(input.buyQuantity)||0));
    const get=Math.max(1,Math.floor(Number(input.getQuantity)||0));
    if(!(Number(input.buyQuantity)>0)||!(Number(input.getQuantity)>0))reasons.push('multibuy-quantity-rule-missing');
    if(!reasons.length){const groupSize=buy+get;const groups=Math.floor(eligibleUnits.length/groupSize);if(groups<1)reasons.push('multibuy-quantity-not-met');else{const sorted=[...eligibleUnits].sort((a,b)=>a.unitPrice-b.unitPrice);for(let i=0;i<groups*get;i++)discounts.push({...sorted[i],discount:sorted[i].unitPrice});}}
  }
  if(type==='cheapest-item-free'){
    const required=Math.max(2,Math.floor(Number(input.requiredQuantity)||2));
    if(!reasons.length){const groups=Math.floor(eligibleUnits.length/required);if(groups<1)reasons.push('multibuy-quantity-not-met');else{const sorted=[...eligibleUnits].sort((a,b)=>a.unitPrice-b.unitPrice);for(let i=0;i<groups;i++)discounts.push({...sorted[i],discount:sorted[i].unitPrice});}}
  }
  if(type==='quantity-tier'){
    const required=Math.max(1,Math.floor(Number(input.requiredQuantity)||0));
    const percent=clamp(input.discountPercent,0,100);
    const fixed=Math.max(0,Number(input.discountPerUnit)||0);
    if(!(Number(input.requiredQuantity)>0))reasons.push('multibuy-quantity-rule-missing');
    if(percent<=0&&fixed<=0)reasons.push('multibuy-discount-missing');
    if(!reasons.length){if(eligibleUnits.length<required)reasons.push('multibuy-quantity-not-met');else eligibleUnits.forEach(u=>{const discount=percent>0?u.unitPrice*(percent/100):Math.min(u.unitPrice,fixed);discounts.push({...u,discount:money(discount)});});}
  }
  const eligible=reasons.length===0;
  const itemDiscounts={};let totalDiscount=0;
  if(eligible){discounts.forEach(d=>{const value=money(Math.min(d.unitPrice,d.discount));itemDiscounts[d.id]=money((itemDiscounts[d.id]||0)+value);totalDiscount+=value;});totalDiscount=money(totalDiscount);}
  const currentItemDiscount=currentItemId==null?0:money(itemDiscounts[currentItemId]||0);
  const currentItemSpend=money(eligibleUnits.filter(u=>u.id===currentItemId).reduce((sum,u)=>sum+u.unitPrice,0));
  const currentItemEffectiveCost=money(Math.max(0,currentItemSpend-currentItemDiscount));
  const status=eligible?'eligible':reasons.some(r=>r.includes('unconfirmed'))?'unknown':'ineligible';
  if(eligible&&totalDiscount>0)warnings.push('Multi-buy savings require purchasing the full qualifying quantity.');
  return{type,status,eligible,basketComplete,unitCount:units.length,eligibleUnitCount:eligibleUnits.length,totalDiscount:money(totalDiscount),itemDiscounts,currentItemId,currentItemDiscount,currentItemSpend,currentItemEffectiveCost,currentItemEffectiveUnitCost:money(currentItemSpend>0?currentItemEffectiveCost/Math.max(1,eligibleUnits.filter(u=>u.id===currentItemId).length):0),reasons,warnings,units};
}
return{normalizeUnits,evaluateMultiBuyPromotion};
});