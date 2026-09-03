(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.HUNTIQResaleDispersionRisk=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const median=(values)=>{const a=[...values].sort((x,y)=>x-y);const n=a.length;if(!n)return 0;const m=Math.floor(n/2);return n%2?a[m]:(a[m-1]+a[m])/2;};
  const percentile=(values,p)=>{const a=[...values].sort((x,y)=>x-y);if(!a.length)return 0;const i=(a.length-1)*p;const lo=Math.floor(i),hi=Math.ceil(i);if(lo===hi)return a[lo];return a[lo]+(a[hi]-a[lo])*(i-lo);};

  function assessResaleDispersion(input={}){
    const prices=(input.soldPrices||[]).map(Number).filter(Number.isFinite).filter(v=>v>0);
    const projected=Number(input.projectedResale)||0;
    const acquisition=Number(input.acquisitionCost)||0;
    const fees=Number(input.marketplaceFees)||0;
    const shipping=Number(input.shippingCost)||0;
    const other=Number(input.otherCosts)||0;
    const sampleSize=prices.length;
    if(sampleSize<4){
      const profit=projected-acquisition-fees-shipping-other;
      return {sampleSize,dispersionStatus:'insufficient',dispersionScore:0.35,haircutPct:0.12,adjustedResale:projected*0.88,adjustedProfit:projected*0.88-acquisition-fees-shipping-other,adjustedRoi:acquisition>0?((projected*0.88-acquisition-fees-shipping-other)/acquisition)*100:0,alertAction:'digest',blocked:true,reason:'Too few sold prices to trust resale dispersion.'};
    }
    const med=median(prices);
    const q1=percentile(prices,0.25),q3=percentile(prices,0.75);
    const iqr=Math.max(0,q3-q1);
    const robustSpread=med>0?iqr/med:1;
    let status='stable',score=0.95,haircut=0;
    if(robustSpread>0.5){status='extreme';score=0.35;haircut=0.18;}
    else if(robustSpread>0.3){status='volatile';score=0.55;haircut=0.12;}
    else if(robustSpread>0.18){status='mixed';score=0.75;haircut=0.06;}
    const adjustedResale=projected*(1-haircut);
    const adjustedProfit=adjustedResale-acquisition-fees-shipping-other;
    const adjustedRoi=acquisition>0?(adjustedProfit/acquisition)*100:0;
    const blocked=status==='extreme'||adjustedProfit<=0||adjustedRoi<10;
    let alertAction='instant';
    if(blocked) alertAction='digest';
    else if(status==='volatile') alertAction='standard';
    else if(status==='mixed') alertAction='standard';
    return {sampleSize,median:med,q1,q3,iqr,robustSpread:Number(robustSpread.toFixed(4)),dispersionStatus:status,dispersionScore:score,haircutPct:haircut,adjustedResale:Number(adjustedResale.toFixed(2)),adjustedProfit:Number(adjustedProfit.toFixed(2)),adjustedRoi:Number(adjustedRoi.toFixed(2)),alertAction,blocked,reason:`${status} resale price dispersion across ${sampleSize} sold comps.`};
  }

  function applyDispersionAlertGate(alert,assessment){
    if(!alert||!assessment) return alert;
    const rank={digest:0,standard:1,instant:2};
    const current=alert.urgency||'standard';
    const allowed=assessment.alertAction||'standard';
    return {...alert,urgency:rank[current]<=rank[allowed]?current:allowed,dispersionBlocked:Boolean(assessment.blocked),dispersionStatus:assessment.dispersionStatus};
  }

  return {assessResaleDispersion,applyDispersionAlertGate,median,percentile};
});