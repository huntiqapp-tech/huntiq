(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQDealCoach=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const money=v=>num(v)==null?'n/a':`$${Math.round(num(v)).toLocaleString('en-US')}`;
const pct=v=>num(v)==null?'n/a':`${Math.round(num(v))}%`;
function buildDealCoach(deal={}){
  const anomaly=deal.anomaly||{};
  const history=deal.historyAssessment||deal.history||{};
  const resale=deal.resale||{};
  const economics=deal.economics||{};
  const downside=deal.downsideEconomics||deal.downside||{};
  const risk=deal.riskAdjustedEconomics||{};
  const decision=deal.purchaseDecision||{};
  const alert=deal.alert||{};
  const momentum=deal.opportunityMomentum||deal.momentum||{};
  const reasons=[];const cautions=[];
  const drop=num(anomaly.dropPct),anomalyConfidence=num(deal.confidence==null?anomaly.confidence:deal.confidence),historyCoverage=num(history.historyCoverageScore==null?history.confidence:history.historyCoverageScore),sold=num(resale.soldCount),resaleConfidence=num(resale.resaleConfidence),liquidity=num(resale.liquidityScore),roi=num(economics.roi),profit=num(economics.profit),downsideRoi=num(downside.roi),riskProfit=num(risk.profit),maxBuy=num(decision.maxBuyPrice),price=num(deal.price);
  const momentumScore=num(momentum.score),persistenceDays=num(momentum.persistenceDays),resaleTrendPct=num(momentum.resaleTrendPct),momentumProfit=num(momentum.momentumAdjustedProfit),momentumRoi=num(momentum.momentumAdjustedRoi);
  if(drop!=null&&drop>=40)reasons.push(`Price is ${pct(drop)} below the store-local historical baseline.`);else if(drop!=null&&drop>=20)reasons.push(`Price is meaningfully below its recent historical baseline (${pct(drop)}).`);
  if(anomalyConfidence!=null&&anomalyConfidence>=70)reasons.push(`Anomaly evidence is strong at ${pct(anomalyConfidence)} confidence.`);else if(anomalyConfidence!=null&&anomalyConfidence<55)cautions.push(`Anomaly confidence is only ${pct(anomalyConfidence)}; verify the shelf/checkout price before acting.`);
  if(historyCoverage!=null&&historyCoverage>=70)reasons.push(`Price-history coverage is healthy (${pct(historyCoverage)}).`);else if(historyCoverage!=null&&historyCoverage<55)cautions.push(`Price-history coverage is thin (${pct(historyCoverage)}), so the baseline can move as more observations arrive.`);
  if(resaleConfidence!=null&&resaleConfidence>=65&&sold!=null&&sold>=10)reasons.push(`Resale evidence is supported by ${Math.round(sold)} recent sold observations at ${pct(resaleConfidence)} confidence.`);else if(resaleConfidence!=null&&resaleConfidence<55)cautions.push(`Resale confidence is ${pct(resaleConfidence)}; sold-price estimates need more evidence.`);
  if(liquidity!=null&&liquidity>=60)reasons.push(`Liquidity is favorable (${pct(liquidity)}), reducing capital tie-up risk.`);else if(liquidity!=null&&liquidity<40)cautions.push(`Liquidity is weak (${pct(liquidity)}); capital may stay tied up longer than the headline ROI suggests.`);
  if(profit!=null&&roi!=null&&profit>0&&roi>=40)reasons.push(`Base economics show about ${money(profit)} profit at ${pct(roi)} ROI after modeled costs.`);else if(profit!=null&&profit<=0)cautions.push('Modeled base economics are not profitable after costs.');
  if(downsideRoi!=null&&downsideRoi>=20)reasons.push(`Downside economics remain positive at roughly ${pct(downsideRoi)} ROI.`);else if(downsideRoi!=null&&downsideRoi<10)cautions.push(`Downside ROI falls to ${pct(downsideRoi)}, leaving little room for resale-price or fee error.`);
  if(riskProfit!=null&&riskProfit>0&&profit!=null&&riskProfit<profit)cautions.push(`Risk-adjusted profit falls to about ${money(riskProfit)} after confidence haircuts.`);
  if(momentumScore!=null&&momentumScore>=70)reasons.push(`Opportunity momentum is healthy at ${pct(momentumScore)}; the markdown still looks relatively fresh versus resale pressure.`);
  if(persistenceDays!=null&&persistenceDays>=14)cautions.push(`This retailer markdown has persisted for about ${Math.round(persistenceDays)} days, so it may be becoming the new normal price.`);
  if(resaleTrendPct!=null&&resaleTrendPct<=-10)cautions.push(`Recent sold prices are trending about ${pct(Math.abs(resaleTrendPct))} below the prior resale window.`);
  if(momentumProfit!=null&&momentumRoi!=null&&profit!=null&&momentumProfit<profit)cautions.push(`Momentum-adjusted economics fall to about ${money(momentumProfit)} profit at ${pct(momentumRoi)} ROI.`);
  if(Array.isArray(momentum.blockers))for(const blocker of momentum.blockers){const text=String(blocker||'').trim();if(text&&!cautions.includes(text))cautions.push(text);}
  if(maxBuy!=null&&price!=null){const headroom=maxBuy-price;if(headroom>=0)reasons.push(`Current price is ${money(headroom)} under HUNTIQ's safe max-buy threshold of ${money(maxBuy)}.`);else cautions.push(`Current price is ${money(Math.abs(headroom))} above the safe max-buy threshold of ${money(maxBuy)}.`);}
  if(alert.alert===true)reasons.push(`Current evidence clears the ${String(alert.priority||'standard')} alert gate.`);else if(alert.priority)cautions.push(`Alert gate is currently ${String(alert.priority)}; HUNTIQ is not treating this as an urgent buy.`);
  const origin=String(deal.dataOrigin||'').toLowerCase();if(origin==='demo')cautions.unshift('This is demonstration data, not a live retailer or sold-market signal.');
  const verdictRaw=String(decision.verdict||deal.recommendation||'').toLowerCase();let verdict='WATCH';if(verdictRaw.includes('skip')||verdictRaw.includes('pass')||verdictRaw.includes('avoid')||(roi!=null&&roi<0))verdict='SKIP';else if(verdictRaw.includes('buy')||verdictRaw.includes('strong')||(roi!=null&&roi>=40&&downsideRoi!=null&&downsideRoi>=15&&anomalyConfidence!=null&&anomalyConfidence>=60))verdict='BUY';
  if(momentum.alertEligible===false&&verdict==='BUY')verdict='WATCH';
  if(cautions.some(c=>c.startsWith('This is demonstration data')))verdict='WATCH';
  const headline=verdict==='BUY'?'Worth a closer look before inventory disappears.':verdict==='SKIP'?'The numbers do not clear HUNTIQ’s safety floor.':'Interesting, but verify the weak link before buying.';
  const summary=[reasons[0],cautions[0]].filter(Boolean).join(' ');
  return{verdict,headline,summary,reasons,cautions,metrics:{dropPct:drop,anomalyConfidence,historyCoverage,resaleConfidence,soldCount:sold,liquidityScore:liquidity,profit,roi,downsideRoi,riskAdjustedProfit:riskProfit,maxBuyPrice:maxBuy,currentPrice:price,momentumScore,persistenceDays,resaleTrendPct,momentumAdjustedProfit:momentumProfit,momentumAdjustedRoi:momentumRoi},generatedFrom:'deterministic-evaluator-evidence'};
}
return{buildDealCoach};
});