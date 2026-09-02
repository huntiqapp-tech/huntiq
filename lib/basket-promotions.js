(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQBasketPromotions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function normalizeItems(items=[]){return (Array.isArray(items)?items:[]).map((item,index)=>{const quantity=Math.max(0,Number(item&&item.quantity==null?1:item.quantity)||0);const unitPrice=Math.max(0,Number(item&&item.unitPrice==null?item&&item.price:item.unitPrice)||0);const lineSpend=money(quantity*unitPrice);return{id:String(item&&item.id!=null?item.id:index),quantity,unitPrice:money(unitPrice),lineSpend,eligible:item&&item.eligible!==false};});}
function allocateBasketPromotion(input={}){
  const items=normalizeItems(input.items);const threshold=Math.max(0,Number(input.threshold)||0);const requestedReward=Math.max(0,Number(input.rewardValue==null?input.reward:input.rewardValue)||0);const basketComplete=input.basketComplete===true;const currentItemId=input.currentItemId==null?null:String(input.currentItemId);const method=String(input.allocationMethod||'proportional-qualified-spend');
  const eligibleItems=items.filter(i=>i.eligible&&i.lineSpend>0);const qualifyingSpend=money(eligibleItems.reduce((sum,i)=>sum+i.lineSpend,0));const reasons=[];const warnings=[];
  if(!basketComplete)reasons.push('basket-completeness-unconfirmed');
  if(!items.length)reasons.push('basket-items-missing');
  if(threshold>0&&qualifyingSpend<threshold)reasons.push('basket-threshold-not-met');
  if(requestedReward<=0)reasons.push('basket-reward-missing');
  if(currentItemId!=null&&!items.some(i=>i.id===currentItemId))reasons.push('current-item-not-in-basket');
  if(method!=='proportional-qualified-spend')reasons.push('unsupported-allocation-method');
  const eligible=reasons.length===0;const allocations={};let allocatedTotal=0;
  if(eligible&&qualifyingSpend>0){for(const item of eligibleItems){const share=item.lineSpend/qualifyingSpend;const allocation=money(Math.min(item.lineSpend,requestedReward*share));allocations[item.id]=allocation;allocatedTotal+=allocation;}allocatedTotal=money(allocatedTotal);const remainder=money(Math.min(requestedReward,qualifyingSpend)-allocatedTotal);if(Math.abs(remainder)>=.01&&eligibleItems.length){const largest=[...eligibleItems].sort((a,b)=>b.lineSpend-a.lineSpend)[0];allocations[largest.id]=money((allocations[largest.id]||0)+remainder);allocatedTotal=money(allocatedTotal+remainder);}if(requestedReward>qualifyingSpend)warnings.push('basket-reward-capped-at-qualified-spend');}
  const currentItemAllocation=currentItemId==null?0:money(allocations[currentItemId]||0);const allocationShare=requestedReward>0?clamp(currentItemAllocation/requestedReward,0,1):0;
  return{status:eligible?'eligible':reasons.some(r=>r.includes('unconfirmed'))?'unknown':'ineligible',eligible,basketComplete,threshold:money(threshold),requestedReward:money(requestedReward),qualifyingSpend,allocationMethod:method,allocations,allocatedTotal:money(allocatedTotal),currentItemId,currentItemAllocation,allocationShare:+allocationShare.toFixed(4),reasons,warnings,items};
}
return{normalizeItems,allocateBasketPromotion};
});