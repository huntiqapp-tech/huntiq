function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
function round(value,digits=3){const p=10**digits;return Math.round(value*p)/p;}
function median(values){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;}

function normalizeObservation(item){
  if(typeof item==='number')return Number.isFinite(item)&&item>0?{price:item,observedAt:null}:null;
  if(!item||typeof item!=='object')return null;
  const price=Number(item.price??item.currentPrice??item.amount);
  if(!Number.isFinite(price)||price<=0)return null;
  const observedAt=item.observedAt??item.observed_at??item.timestamp??null;
  const parsed=observedAt?Date.parse(observedAt):NaN;
  return {price,observedAt:Number.isFinite(parsed)?parsed:null};
}

export function assessPriceRarityRisk(input={}){
  const currentPrice=Math.max(0,Number(input.currentPrice)||0);
  const expectedProfit=Number(input.expectedProfit)||0;
  const roi=Number.isFinite(Number(input.roi))?Number(input.roi):null;
  const anomalyScore=clamp(Number(input.anomalyScore??1),0,1);
  const tolerance=clamp(Number(input.comparableLowTolerancePct??0.03),0,0.2);
  const history=(Array.isArray(input.history)?input.history:[]).map(normalizeObservation).filter(Boolean);
  const prices=history.map(x=>x.price);
  const sampleSize=prices.length;

  if(!currentPrice||sampleSize===0){
    return {sampleSize,historyMedian:null,pricePercentile:null,nearLowShare:null,daysSinceComparableLow:null,rarityScore:0.35,adjustedAnomalyScore:round(anomalyScore*0.74),confidenceAdjustedProfit:round(expectedProfit*0.71,2),confidenceAdjustedRoi:roi===null?null:round(roi*0.71,2),alertAction:'standard',blocked:false,reason:'insufficient_price_history'};
  }

  const historyMedian=median(prices);
  const pricePercentile=prices.filter(price=>price<=currentPrice).length/sampleSize;
  const comparableCeiling=currentPrice*(1+tolerance);
  const comparable=history.filter(item=>item.price<=comparableCeiling);
  const nearLowShare=comparable.length/sampleSize;
  const depth=historyMedian>0?clamp((historyMedian-currentPrice)/historyMedian,0,1):0;
  const depthScore=clamp(depth/0.5,0,1);
  const coverageScore=clamp(sampleSize/20,0.25,1);
  const isNewLow=currentPrice<Math.min(...prices);
  let rarityScore=(0.45*(1-nearLowShare)+0.35*(1-pricePercentile)+0.20*depthScore)*coverageScore;
  if(isNewLow&&sampleSize>=8)rarityScore=Math.max(rarityScore,0.82);
  rarityScore=round(clamp(rarityScore,0,1));

  const datedComparable=comparable.filter(item=>item.observedAt!==null).sort((a,b)=>b.observedAt-a.observedAt);
  const nowMs=Number.isFinite(Date.parse(input.asOf))?Date.parse(input.asOf):Date.now();
  const daysSinceComparableLow=datedComparable.length?round(Math.max(0,(nowMs-datedComparable[0].observedAt)/86400000),1):null;

  const confidenceFactor=round(0.55+0.45*rarityScore);
  const adjustedAnomalyScore=round(anomalyScore*(0.6+0.4*rarityScore));
  const confidenceAdjustedProfit=round(expectedProfit*confidenceFactor,2);
  const confidenceAdjustedRoi=roi===null?null:round(roi*confidenceFactor,2);
  let alertAction='preserve';
  if(sampleSize<5||rarityScore<0.5)alertAction='standard';
  if(sampleSize>=8&&rarityScore<0.25)alertAction='digest';
  const blocked=expectedProfit>0&&confidenceAdjustedProfit<=0;

  let reason='rare_price_event';
  if(alertAction==='digest')reason='recurring_low_price_not_rare';
  else if(alertAction==='standard')reason=sampleSize<5?'thin_price_history':'moderately_recurring_low';

  return {sampleSize,historyMedian:round(historyMedian,2),pricePercentile:round(pricePercentile),nearLowShare:round(nearLowShare),daysSinceComparableLow,rarityScore,isNewLow,adjustedAnomalyScore,confidenceFactor,confidenceAdjustedProfit,confidenceAdjustedRoi,alertAction,blocked,reason};
}
