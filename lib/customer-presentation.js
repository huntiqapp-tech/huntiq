(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQCustomerPresentation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
function presentDeal(deal={},health={}){
  const economics=deal.riskAdjustedEconomics||deal.economics||{};
  const resale=deal.resale||{};
  const lifecycle=deal.lifecycle||{};
  const price=Number(deal.price)||0;
  const resaleValue=Number(resale.marketValue==null?deal.market:resale.marketValue)||0;
  const profit=Number(economics.profit==null?deal.profit:economics.profit)||0;
  const roi=Number(economics.roi==null?deal.roi:economics.roi)||0;
  const maxBuy=Number((deal.purchaseDecision||{}).maxBuyPrice)||0;
  const recommendation=health.recommendation||'WAIT';
  const score=Number(health.score)||0;
  const reasons=(health.blockers&&health.blockers.length?health.blockers:health.watchReasons)||[];
  const badges=[...(health.badges||[])];
  if(deal.retailer==='Home Depot'&&deal.penny&&Number(deal.penny.score)>=45)badges.unshift(`${Math.round(deal.penny.score)}% Penny`);
  if(Number(resale.liquidityScore)>=70)badges.push('High Demand');
  return{score,recommendation,state:health.state||'WATCH',headline:`${money(price)} → ~${money(resaleValue)} resale`,economicsLine:`${profit>=0?'+':''}${money(profit)} net profit • ${Math.round(roi)}% ROI`,maxBuyLine:maxBuy>0?`Max safe buy ${money(maxBuy)}`:'Max safe buy unavailable',badges:[...new Set(badges)].slice(0,4),reasons,lifecycle:lifecycle.phase||null};
}
return{presentDeal};
});