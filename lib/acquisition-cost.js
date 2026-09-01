(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQAcquisitionCost=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const money=n=>+(Number(n)||0).toFixed(2);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
function evaluateAcquisition(opportunity={}){
  const acquisition=opportunity.acquisition||{};
  const stickerPrice=Math.max(0,Number(acquisition.stickerPrice==null?opportunity.price:acquisition.stickerPrice)||0);
  const instantDiscount=Math.max(0,Number(acquisition.instantDiscount)||0);
  const checkoutCredit=Math.max(0,Number(acquisition.checkoutCredit)||0);
  const checkoutPrice=Math.max(0,stickerPrice-instantDiscount-checkoutCredit);
  const taxRate=Math.max(0,Number(acquisition.taxRate==null?opportunity.taxRate:acquisition.taxRate)||0);
  const taxablePrice=Math.max(0,Number(acquisition.taxablePrice==null?checkoutPrice:acquisition.taxablePrice)||0);
  const purchaseTax=taxablePrice*taxRate;
  const futureCredit=Math.max(0,Number(acquisition.futureCredit==null?acquisition.rebateCredit:acquisition.futureCredit)||0);
  const realizationRate=clamp(acquisition.realizationRate==null?(futureCredit>0?.8:0):acquisition.realizationRate,0,1);
  const daysToCredit=Math.max(0,Number(acquisition.daysToCredit)||0);
  const annualDiscountRate=clamp(acquisition.annualDiscountRate==null?.08:acquisition.annualDiscountRate,0,1);
  const timeValueFactor=daysToCredit>0?1/Math.pow(1+annualDiscountRate,daysToCredit/365):1;
  const expectedFutureCredit=futureCredit*realizationRate*timeValueFactor;
  const cashOutlay=checkoutPrice+purchaseTax;
  const economicAcquisitionCost=Math.max(0,cashOutlay-expectedFutureCredit);
  const futureCreditType=String(acquisition.futureCreditType||acquisition.rebateType||'store-credit');
  return{stickerPrice:money(stickerPrice),instantDiscount:money(instantDiscount),checkoutCredit:money(checkoutCredit),checkoutPrice:money(checkoutPrice),taxRate:+taxRate.toFixed(4),taxablePrice:money(taxablePrice),purchaseTax:money(purchaseTax),cashOutlay:money(cashOutlay),futureCredit:money(futureCredit),futureCreditType,realizationRate:+realizationRate.toFixed(3),daysToCredit:+daysToCredit.toFixed(1),annualDiscountRate:+annualDiscountRate.toFixed(4),timeValueFactor:+timeValueFactor.toFixed(4),expectedFutureCredit:money(expectedFutureCredit),economicAcquisitionCost:money(economicAcquisitionCost),hasDeferredValue:futureCredit>0,warning:futureCredit>0?'Future rebate/store credit is not an immediate checkout discount.':null};
}
return{evaluateAcquisition};
});