function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
function money(value){return Math.round((Number(value)||0)*100)/100;}

export function assessResaleSupplyPressure(input={}){
  const activeListings=Math.max(0,Number(input.activeListings)||0);
  const soldCount=Math.max(0,Number(input.soldCount)||0);
  const soldWindowDays=Math.max(1,Number(input.soldWindowDays)||30);
  const acquisitionCost=Math.max(0,Number(input.acquisitionCost)||0);
  const resaleValue=Math.max(0,Number(input.resaleValue)||0);
  const marketplaceFeeRate=clamp(Number(input.marketplaceFeeRate??0.13),0,0.5);
  const shippingCost=Math.max(0,Number(input.shippingCost)||0);

  const sellThroughRate=(activeListings+soldCount)>0?soldCount/(activeListings+soldCount):0;
  const salesPerDay=soldCount/soldWindowDays;
  const marketInventoryDays=salesPerDay>0?activeListings/salesPerDay:null;

  let level='healthy',haircut=0,alertAction='preserve';
  if(soldCount===0){level='blocked';haircut=0.25;alertAction='digest';}
  else if(sellThroughRate<0.2){level='severe';haircut=0.18;alertAction='digest';}
  else if(sellThroughRate<0.4){level='elevated';haircut=0.10;alertAction='standard';}
  else if(sellThroughRate<0.6){level='moderate';haircut=0.05;alertAction='standard';}

  const adjustedResaleValue=money(resaleValue*(1-haircut));
  const expectedNetProceeds=money(adjustedResaleValue*(1-marketplaceFeeRate)-shippingCost);
  const adjustedProfit=money(expectedNetProceeds-acquisitionCost);
  const adjustedRoi=acquisitionCost>0?Math.round((adjustedProfit/acquisitionCost)*10000)/100:null;
  const blocked=soldCount===0||adjustedProfit<=0;
  if(blocked)alertAction='digest';

  return {
    activeListings,soldCount,soldWindowDays,
    sellThroughRate:Math.round(sellThroughRate*10000)/10000,
    marketInventoryDays:marketInventoryDays==null?null:Math.round(marketInventoryDays*10)/10,
    level,haircut,adjustedResaleValue,expectedNetProceeds,adjustedProfit,adjustedRoi,
    alertAction,blocked
  };
}
