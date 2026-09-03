(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQOpportunityRange=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const percentile=(values,p)=>{const a=(values||[]).map(finite).filter(v=>v!=null&&v>0).sort((x,y)=>x-y);if(!a.length)return null;if(a.length===1)return a[0];const i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i),w=i-lo;return a[lo]*(1-w)+a[hi]*w;};
function economics(exitPrice,input={}){const buy=finite(input.buyPrice),feeRate=Math.max(0,finite(input.feeRate)||0),shipping=Math.max(0,finite(input.shipping)||0),other=Math.max(0,finite(input.otherCosts)||0);if(exitPrice==null||buy==null||buy<=0)return null;const proceeds=exitPrice*(1-feeRate)-shipping-other;const profit=proceeds-buy;return{exitPrice:Number(exitPrice.toFixed(2)),profit:Number(profit.toFixed(2)),roi:Number((profit/buy*100).toFixed(2))};}
function assessOpportunityRange(input={}){
 const sold=(input.soldPrices||input.resale?.soldPrices||[]).map(finite).filter(v=>v!=null&&v>0);const anomaly=input.anomaly||{};const confidence=clamp(input.confidence==null?anomaly.confidence:input.confidence);const drop=finite(anomaly.dropPct);const p25=percentile(sold,.25),p50=percentile(sold,.5),p75=percentile(sold,.75);
 const common={buyPrice:finite(input.buyPrice==null?input.price:input.buyPrice),feeRate:finite(input.feeRate==null?input.resale?.feeRate:input.feeRate),shipping:finite(input.shipping==null?input.resale?.shipping:input.shipping),otherCosts:finite(input.otherCosts)};
 const conservative=economics(p25,common),base=economics(p50,common),upside=economics(p75,common);const blockers=[],cautions=[];
 if(sold.length<5)blockers.push('insufficient sold-price depth');if(confidence<50)blockers.push('weak anomaly confidence');if(drop!=null&&drop<20)cautions.push('modest historical price deviation');
 if(conservative&&conservative.roi<5)blockers.push('conservative ROI below safety floor');else if(conservative&&conservative.roi<15)cautions.push('thin conservative ROI margin');
 const dispersion=p50?((p75-p25)/p50)*100:null;if(dispersion!=null&&dispersion>45)blockers.push('high sold-price dispersion');else if(dispersion!=null&&dispersion>25)cautions.push('sold prices are dispersed');
 const origin=String(input.dataOrigin||'').toLowerCase();if(origin==='demo')blockers.push('demonstration data');
 const alertEligible=!!(conservative&&base&&conservative.roi>=5&&base.roi>=15&&sold.length>=5&&confidence>=50&&!blockers.length&&origin!=='demo');
 return{soldCount:sold.length,p25:p25==null?null:Number(p25.toFixed(2)),median:p50==null?null:Number(p50.toFixed(2)),p75:p75==null?null:Number(p75.toFixed(2)),dispersionPct:dispersion==null?null:Number(dispersion.toFixed(2)),conservative,base,upside,blockers,cautions,alertEligible,method:'sold-price-percentile-profit-range'};
}
return{assessOpportunityRange,percentile,economics};
});