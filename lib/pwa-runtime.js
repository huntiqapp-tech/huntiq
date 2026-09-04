(function(root){
'use strict';
if(!root.HuntIQPwaOpportunity||!root.HuntIQDataState||typeof deals==='undefined'||typeof renderDeals!=='function')return;
if(!document.querySelector('#marketRealityStyles')){const style=document.createElement('style');style.id='marketRealityStyles';style.textContent='.market-reality-line{margin-top:9px;padding:9px 10px;border-radius:10px;font-size:12px;font-weight:800;line-height:1.45}.market-reality-line.positive{background:rgba(53,224,177,.08);color:var(--green2)}.market-reality-line.caution{background:rgba(255,207,102,.09);color:var(--warn)}';document.head.append(style);}
for(const d of deals){
  try{
    d.dataState=root.HuntIQDataState.classifyOpportunityData(d,{asOf:d.observedAt||new Date().toISOString()});
    const strict=root.HuntIQPwaOpportunity.evaluateForPwa(d,d,{asOf:d.observedAt||new Date().toISOString()});
    d.strictEvaluation=strict;d.marketReality=strict.marketReality||null;d.strictVelocity=strict.velocity||null;d.partialLiquidation=strict.partialLiquidation||null;d.resaleDecay=strict.resaleDecay||null;
    d.retailerSourceReliability=strict.sourceReliability&&strict.sourceReliability.retailer||null;d.resaleSourceReliability=strict.sourceReliability&&strict.sourceReliability.resale||null;d.combinedSourceReliability=strict.sourceReliability&&strict.sourceReliability.combined||null;
    d.sourceAdjustedProfit=strict.economics&&strict.economics.sourceAdjustedProfit!=null?strict.economics.sourceAdjustedProfit:null;d.sourceAdjustedRoi=strict.economics&&strict.economics.sourceAdjustedRoi!=null?strict.economics.sourceAdjustedRoi:null;d.decayAdjustedProfit=strict.economics&&strict.economics.decayAdjustedProfit!=null?strict.economics.decayAdjustedProfit:null;d.decayAdjustedRoi=strict.economics&&strict.economics.decayAdjustedRoi!=null?strict.economics.decayAdjustedRoi:null;d.decisionFloorProfit=strict.economics&&strict.economics.decisionFloorProfit!=null?strict.economics.decisionFloorProfit:null;d.decisionFloorRoi=strict.economics&&strict.economics.decisionFloorRoi!=null?strict.economics.decisionFloorRoi:null;
    d.resalePriceIntegrity=strict.resale&&strict.resale.priceIntegrity!=null?strict.resale.priceIntegrity:null;d.resaleOutlierCount=strict.resale&&strict.resale.outlierCount!=null?strict.resale.outlierCount:null;d.resaleFreshnessScore=strict.resale&&strict.resale.resaleFreshnessScore!=null?strict.resale.resaleFreshnessScore:null;d.newestCompletedSaleAgeDays=strict.resale&&strict.resale.newestSaleAgeDays!=null?strict.resale.newestSaleAgeDays:null;d.medianCompletedSaleAgeDays=strict.resale&&strict.resale.medianSaleAgeDays!=null?strict.resale.medianSaleAgeDays:null;
    const acq=strict.economics&&strict.economics.acquisition||null;d.multiBuyPromotion=acq&&acq.multiBuyPromotion||null;d.multiBuyDiscount=acq&&acq.multiBuyDiscount!=null?acq.multiBuyDiscount:null;
    if(strict.resale&&strict.resale.marketValue>0)d.market=strict.resale.marketValue;if(strict.economics&&strict.economics.riskAdjustedProfit!=null)d.profit=strict.economics.riskAdjustedProfit;if(strict.economics&&strict.economics.riskAdjustedRoi!=null)d.roi=strict.economics.riskAdjustedRoi;
    const customerAlertEligible=strict.evidence.alertEligible&&d.dataState.alertEligible;
    const dataBlocker=d.dataState.alertEligible?[]:[d.dataState.reason||'customer-data-state'];
    d.strictRecommendation=strict.recommendation;d.alert={...(d.alert||{}),alert:customerAlertEligible,priority:customerAlertEligible?(strict.evidence.alertLevel||'standard'):'suppressed',strict:true,blockers:[...(strict.evidence.blockers||[]),...dataBlocker],warnings:strict.evidence.warnings||[]};
  }catch(err){d.strictEvaluationError=String(err&&err.message||err);}
}
const pct=v=>v==null?'n/a':`${Math.round(Number(v))}%`;const dollars=v=>v==null?'n/a':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v));
function marketRealityText(d){
  const m=d.marketReality;if(!m)return null;
  const evidence=d.dataState&&d.dataState.kind==='demo'?'Demo sold-market check':'Verified sold-market check';
  if(m.verdict==='sold-market-unknown')return 'Sold-market value unavailable — retailer MSRP/reference price is context only.';
  const delta=Number(m.marketSpread)||0;
  const edge=delta>0?`${dollars(delta)} gross edge before fees`:delta<0?`${dollars(Math.abs(delta))} above sold market before fees`:'at sold-market value before fees';
  return `${evidence}: retail ${dollars(m.acquisitionPrice)} vs ${dollars(m.soldMarketValue)} sold market · ${edge}.`;
}
function marketRealityDetail(d){
  const m=d.marketReality;if(!m)return'';const summary=marketRealityText(d);
  const reference=m.referencePrice==null?'':`<br>Retailer reference: ${dollars(m.referencePrice)}${m.referenceDiscountPct==null?'':` (${pct(m.referenceDiscountPct)} off)`} — context only, never resale value.`;
  return `<br><strong>Market reality</strong>: ${summary}${reference}`;
}
function promotionLine(d){const p=d.multiBuyPromotion;if(!p)return'';const limit=p.redemptionLimit==null?'none stated':p.redemptionLimit;return `<br><strong>Quantity offer</strong>: ${p.type} · eligible units: ${p.eligibleUnitCount} · redemptions applied: ${p.appliedRedemptions}/${p.availableRedemptions} · limit: ${limit} · mix & match: ${p.mixAndMatch?'yes':'no'} · savings: ${dollars(d.multiBuyDiscount)} · effective item cost: ${dollars(p.currentItemEffectiveCost)}${p.currentItemEffectiveUnitCost?` (${dollars(p.currentItemEffectiveUnitCost)}/unit)`:''}`;}
function liquidationLine(d){const p=d.partialLiquidation;if(!p)return'';const h=p.horizons||[];const f=days=>h.find(x=>x.days===days)||{};return `<br><strong>Capital release</strong>: 30d ${f(30).expectedUnitsSold||0}/${p.purchaseQuantity} sold · ${dollars(f(30).capitalTiedUp)} tied up; 60d ${f(60).expectedUnitsSold||0}/${p.purchaseQuantity} sold · ${dollars(f(60).capitalTiedUp)} tied up; 90d ${f(90).expectedUnitsSold||0}/${p.purchaseQuantity} sold · ${dollars(f(90).capitalTiedUp)} tied up (${pct(p.capitalAtRisk90Pct)} of buy capital) · exposure: ${p.band}`;}
function decayLine(d){const p=d.resaleDecay;if(!p)return'';return `<br><strong>Resale decay stress</strong>: trend 30d vs 90d ${p.trend30vs90Pct==null?'n/a':pct(p.trend30vs90Pct)} · monthly stress ${pct(p.monthlyDecayPct)} · 30/60/90 exit ${dollars(p.prices&&p.prices.d30)} / ${dollars(p.prices&&p.prices.d60)} / ${dollars(p.prices&&p.prices.d90)} · weighted exit ${dollars(p.weightedSalePrice)} (${pct(p.weightedDecayPct)} below current) · decay-adjusted ROI ${pct(d.decayAdjustedRoi)}`;}
function decorateDetails(){document.querySelectorAll('#dealGrid .deal-card').forEach(card=>{const title=card.querySelector('h3')&&card.querySelector('h3').textContent;const retailer=card.querySelector('.retailer')&&card.querySelector('.retailer').textContent;const d=deals.find(x=>x.title===title&&x.retailer===retailer);const panel=card.querySelector('.comp-panel');if(!d||!panel||panel.querySelector('.strict-evidence'))return;const block=document.createElement('div');block.className='strict-evidence';const rankScore=root.HuntIQOpportunityRanking?root.HuntIQOpportunityRanking.bestOpportunityScore(d):null;block.innerHTML=`<br><strong>HUNTIQ strict evidence</strong>${rankScore==null?'':` · Best Opportunity score: ${rankScore}/100`}<br>Retailer source reliability: ${pct(d.retailerSourceReliability&&d.retailerSourceReliability.score)} · Resale source reliability: ${pct(d.resaleSourceReliability&&d.resaleSourceReliability.score)} · Combined: ${pct(d.combinedSourceReliability&&d.combinedSourceReliability.score)}<br>Resale integrity: ${pct(d.resalePriceIntegrity)} · filtered outliers: ${d.resaleOutlierCount==null?'n/a':d.resaleOutlierCount} · freshness: ${pct(d.resaleFreshnessScore)} · newest sold comp: ${d.newestCompletedSaleAgeDays==null?'n/a':Math.round(d.newestCompletedSaleAgeDays)+'d'}<br>Source-adjusted profit: ${dollars(d.sourceAdjustedProfit)} · source-adjusted ROI: ${pct(d.sourceAdjustedRoi)} · <strong>decision-floor profit: ${dollars(d.decisionFloorProfit)} · ROI: ${pct(d.decisionFloorRoi)}</strong>${promotionLine(d)}${liquidationLine(d)}${decayLine(d)}<br>Alert: ${d.alert&&d.alert.priority||'suppressed'}${d.alert&&d.alert.blockers&&d.alert.blockers.length?` · blockers: ${d.alert.blockers.join(', ')}`:''}${d.alert&&d.alert.warnings&&d.alert.warnings.length?` · warnings: ${d.alert.warnings.join(', ')}`:''}`;panel.appendChild(block);});}
function decorateDataStates(){
  document.querySelectorAll('#dealGrid .deal-card').forEach(card=>{
    const title=card.querySelector('h3')&&card.querySelector('h3').textContent;const retailer=card.querySelector('.retailer')&&card.querySelector('.retailer').textContent;const d=deals.find(x=>x.title===title&&x.retailer===retailer);const top=card.querySelector('.deal-top');
    if(!d||!top||top.querySelector('.data-state-badge'))return;
    const badge=document.createElement('span');badge.className=`data-state-badge ${d.dataState.kind}`;badge.textContent=d.dataState.label;badge.title=d.dataState.kind==='live'?'Validated, fresh provider observation':'Not eligible for live alerts';top.insertBefore(badge,top.querySelector('.badge'));
    const summary=marketRealityText(d);const drop=card.querySelector('.drop');if(summary&&drop&&!card.querySelector('.market-reality-line')){const line=document.createElement('div');line.className=`market-reality-line ${d.marketReality&&d.marketReality.verdict==='below-sold-market'?'positive':'caution'}`;line.textContent=summary;drop.insertAdjacentElement('afterend',line);}
  });
}
const originalDecorateDetails=decorateDetails;
decorateDetails=function(){originalDecorateDetails();document.querySelectorAll('#dealGrid .deal-card').forEach(card=>{const title=card.querySelector('h3')&&card.querySelector('h3').textContent;const retailer=card.querySelector('.retailer')&&card.querySelector('.retailer').textContent;const d=deals.find(x=>x.title===title&&x.retailer===retailer);const block=card.querySelector('.strict-evidence');if(d&&block&&!block.querySelector('.market-reality-detail')){const detail=document.createElement('span');detail.className='market-reality-detail';detail.innerHTML=marketRealityDetail(d);block.prepend(detail);}});};
const filters=document.querySelector('.filters');
if(filters&&!filters.querySelector('[data-filter="demo"]')){
  for(const [key,label] of [['live','Live'],['demo','Demo']]){const button=document.createElement('button');button.className='filter';button.dataset.filter=key;button.textContent=label;button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));button.classList.add('active');active=key;renderDeals();decorateDataStates();});filters.append(button);}
}
let sortMode='best';
function applyOpportunitySort(){
  if(!root.HuntIQOpportunityRanking)return;
  const ranked=root.HuntIQOpportunityRanking.rank(deals,sortMode);
  deals.splice(0,deals.length,...ranked);
}
if(filters&&root.HuntIQOpportunityRanking&&!document.querySelector('#opportunitySort')){
  const select=document.createElement('select');select.id='opportunitySort';select.className='opportunity-sort';select.setAttribute('aria-label','Sort opportunities');
  for(const [value,label] of [['best','Best Opportunity'],['discount','Steepest Discount'],['profit','Highest Profit'],['roi','Highest ROI'],['fastest','Fastest Flip'],['newest','Newest Drops']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
  select.addEventListener('change',()=>{sortMode=select.value;applyOpportunitySort();renderDeals();decorateDetails();decorateDataStates();});filters.prepend(select);
}
const opportunitySection=document.querySelector('#opportunities .section-head');
if(opportunitySection&&!document.querySelector('.customer-data-status')){const counts=deals.reduce((m,d)=>(m[d.dataState.kind]=(m[d.dataState.kind]||0)+1,m),{});const status=document.createElement('div');status.className='customer-data-status';status.innerHTML=`<strong>${counts.live||0} live</strong><span>${counts.cached||0} cached</span><span>${counts.delayed||0} delayed</span><span>${counts.demo||0} demo</span><small>Validation-only provider observations stay hidden and cannot alert.</small>`;opportunitySection.insertAdjacentElement('afterend',status);}
applyOpportunitySort();renderDeals();decorateDetails();decorateDataStates();const grid=document.querySelector('#dealGrid');if(grid&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{decorateDetails();decorateDataStates();}).observe(grid,{childList:true,subtree:true});
})(typeof globalThis!=='undefined'?globalThis:this);
