function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
function money(value){return Math.round((Number(value)||0)*100)/100;}

export function compareResaleExitRoutes(input={}){
  const acquisitionCost=Math.max(0,Number(input.acquisitionCost)||0);
  const routes=Array.isArray(input.routes)?input.routes:[];
  const evaluated=routes.map((route,index)=>{
    const salePrice=Math.max(0,Number(route.salePrice)||0);
    const feeRate=clamp(Number(route.feeRate??0),0,0.6);
    const fixedFees=Math.max(0,Number(route.fixedFees)||0);
    const shippingCost=Math.max(0,Number(route.shippingCost)||0);
    const confidence=clamp(Number(route.confidence??0.5),0,1);
    const sellThrough=clamp(Number(route.sellThrough??0.5),0,1);
    const grossNet=money(salePrice*(1-feeRate)-fixedFees-shippingCost);
    const profit=money(grossNet-acquisitionCost);
    const roi=acquisitionCost>0?Math.round((profit/acquisitionCost)*10000)/100:null;
    const executionFactor=0.65+0.2*confidence+0.15*sellThrough;
    const riskAdjustedNet=money(grossNet*executionFactor);
    const riskAdjustedProfit=money(riskAdjustedNet-acquisitionCost);
    const riskAdjustedRoi=acquisitionCost>0?Math.round((riskAdjustedProfit/acquisitionCost)*10000)/100:null;
    return {index,name:String(route.name||`route-${index+1}`),salePrice,feeRate,fixedFees,shippingCost,confidence,sellThrough,grossNet,profit,roi,executionFactor:Math.round(executionFactor*1000)/1000,riskAdjustedNet,riskAdjustedProfit,riskAdjustedRoi};
  }).sort((a,b)=>b.riskAdjustedProfit-a.riskAdjustedProfit||b.profit-a.profit);

  const best=evaluated[0]||null;
  const runnerUp=evaluated[1]||null;
  const routeAdvantage=best&&runnerUp?money(best.riskAdjustedProfit-runnerUp.riskAdjustedProfit):best?best.riskAdjustedProfit:null;
  const blocked=!best||best.riskAdjustedProfit<=0;
  let alertAction='preserve';
  if(blocked)alertAction='digest';
  else if(best.confidence<0.55||best.sellThrough<0.25)alertAction='standard';

  return {bestRoute:best,runnerUp,routeAdvantage,blocked,alertAction,routes:evaluated};
}
