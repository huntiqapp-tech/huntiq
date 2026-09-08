'use strict';
const demoDeals=(globalThis.HuntIQDemoOpportunities&&typeof HuntIQDemoOpportunities.list==='function')?HuntIQDemoOpportunities.list():[];
const appFeed=HuntIQCustomerAppBoundary.resolveCustomerAppFeed({
  globalObject:globalThis,
  location:globalThis.location,
  demoOpportunities:demoDeals,
  fixtureFeed:globalThis.HuntIQCustomerFeedFixture&&HuntIQCustomerFeedFixture.feed(),
  asOf:new Date().toISOString()
});
const suppliedDeals=Array.isArray(globalThis.HUNTIQ_CUSTOMER_OPPORTUNITIES)?globalThis.HUNTIQ_CUSTOMER_OPPORTUNITIES:[];
const rawDeals=appFeed.visible;
function evidenceIdentity(d){const demo=d.dataOrigin==='demo';return{source:demo?'demo':(d.source?.provider||'validated-live'),verified:demo||d.validationState==='validated'};}
function timelineForDeal(d){
  const end=Date.parse(d.observedAt||d.timestamp)||Date.now();
  const observedAt=new Date(end).toISOString();
  const demo=d.dataOrigin==='demo';
  let historical=[];
  if(demo){
    const step=7*24*36e5;
    const prices=Array.isArray(d.priceHistory)?d.priceHistory:[];
    historical=prices.map((price,i)=>({
      retailer:d.retailer,sku:d.sku,productId:d.productId,storeId:d.storeId||'online',zip:d.zip||null,
      channel:d.channel||'online',price,observedAt:new Date(end-step*(prices.length-i)).toISOString(),
      inventory:null,source:'demo-history',verified:true
    }));
  }else{
    historical=HuntIQCustomerAppBoundary.filterHistoryObservations(
      d,
      Array.isArray(d.priceHistoryObservations)?d.priceHistoryObservations:[],
      {before:observedAt}
    ).map(row=>({
      retailer:row.retailer,sku:row.sku||d.sku,productId:row.productId||d.productId,
      storeId:row.storeId||null,zip:row.zip||row.zipcode||null,channel:row.channel,
      price:Number(row.price),observedAt:new Date(row.observedAt).toISOString(),inventory:null,
      source:row.source||d.source?.provider||'validated-history',verified:true
    }));
  }
  historical.push({
    retailer:d.retailer,sku:d.sku,productId:d.productId,storeId:d.storeId||null,zip:d.zip||null,
    channel:d.channel||'online',price:d.price,observedAt,inventory:null,
    source:demo?'demo-current':(d.source?.provider||'validated-current'),
    verified:demo||d.validationState==='validated'
  });
  return historical;
}
function evaluateDeal(d){
  const observedAt=d.observedAt||d.timestamp||new Date().toISOString();
  const identity=evidenceIdentity(d);
  const evidence=HuntIQQuality.evidenceQuality({source:identity.source,observedAt,verified:identity.verified,baseQuality:d.dataQuality});
  const economicsComps=HuntIQCustomerAppBoundary.authorizedCompsForEconomics(d);
  const economicClaimsAuthorized=HuntIQCustomerAppBoundary.customerEconomicsAuthorized(d);
  const evaluated=HuntIQEngine.evaluateOpportunity({...d,comps:economicsComps,observedAt,evidenceQuality:evidence.score});
  const timeline=timelineForDeal(d);
  const historyAssessment=HuntIQHistoryAnomaly.assessHistory({currentPrice:d.price,observations:timeline.slice(0,-1),asOf:observedAt,evidenceQuality:evidence.score,inferredIntervalDays:7});
  const penny=HuntIQMarkdown.pennyProbability({observations:timeline,currentPrice:d.price,referencePrice:evaluated.anomaly.baseline||d.referencePrice,anomalyConfidence:evaluated.anomaly.confidence,dataQuality:evidence.score});
  const risk=HuntIQRisk.evaluateRisk(evaluated,HuntIQEngine.economics);
  const base={...evaluated,penny,evidence,risk,historyAssessment};
  const purchaseDecision=HuntIQDecision.purchaseDecision(base,{targetRoi:40,minProfit:50});
  const enriched={...base,purchaseDecision};
  const label=risk.stabilityAdjustedAnomalyLabel;
  const type=label==='Probable Error'?'error':label==='Extreme Deal'?'extreme':'watch';
  const engineAlert=HuntIQAlerts.shouldAlert(enriched);
  const dataState=d.dataState||HuntIQDataState.classifyOpportunityData(d,{asOf:appFeed.asOf});
  const alert=HuntIQCustomerAppBoundary.suppressUnauthorizedAlert({...enriched,alert:engineAlert,customerAlertEligible:d.customerAlertEligible},dataState,appFeed.alertsEnabled);
  return{...enriched,...d,observedAt,timeline,type,label,economicClaimsAuthorized,
    market:economicClaimsAuthorized?evaluated.resale.marketValue:null,
    profit:economicClaimsAuthorized?evaluated.economics.profit:null,
    roi:economicClaimsAuthorized?evaluated.economics.roi:null,
    flip:economicClaimsAuthorized?evaluated.flipScore:null,
    confidence:risk.stabilityAdjustedAnomalyConfidence,rawConfidence:evaluated.anomaly.confidence,
    reference:evaluated.anomaly.baseline||d.referencePrice,alert,dataState,
    provenance:d.provenance||HuntIQCustomerAppBoundary.presentProvenance(d,dataState)};
}
const deals=[];
const evaluationErrors=[];
for(const raw of rawDeals){
  try{deals.push(evaluateDeal(raw));}
  catch(err){evaluationErrors.push({id:raw&&raw.id,reason:String(err&&err.message||err)});}
}
const sources=[{name:'Home Depot',detail:'Top priority: public store-level pricing, clearance progression, markdown velocity and Penny Watch intelligence.',status:'Penny Watch priority',class:'research'},{name:'Best Buy',detail:'Official products, stores, availability and open-box API research.',status:'API route identified',class:'ready'},{name:'Walmart',detail:'Official affiliate/product-data route under integration research.',status:'API route identified',class:'ready'},{name:"Lowe's",detail:'Public research only where retailer terms permit; no resale-oriented scraping.',status:'Restricted research',class:'pending'},{name:'Target',detail:'Public research only. Current terms prohibit systematic scraping/data extraction of product listings and prices.',status:'Restricted research',class:'pending'},{name:'eBay',detail:'Resale market data; sold-history access subject to developer approval.',status:'Developer review',class:'pending'},{name:'Community Signals',detail:'Reddit and public deal communities are leads only; freshness decays until retailer verification.',status:'Lead source only',class:'research'}];
const watchKey='huntiq_watchlist_v1';
const watch=new Set(HuntIQSafeStorage.readList(watchKey));
let active='all';
let searchQuery='';
const money=n=>n==null||!Number.isFinite(Number(n))?'n/a':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n));
const percent=n=>n==null||!Number.isFinite(Number(n))?'n/a':`${Math.round(Number(n))}%`;
const forecastText=f=>!f||!f.forecastable?'insufficient cadence':`${Math.round(f.medianIntervalHours/24)}d cadence · ${f.cadenceConfidence}% confidence · next window ${f.hoursUntilNext<=0?'due/overdue':`~${Math.max(1,Math.round(f.hoursUntilNext/24))}d`}`;
function persistWatch(){
  const result=HuntIQSafeStorage.writeList(watchKey,[...watch]);
  if(!result.ok){
    const status=document.querySelector('#appStatus');
    if(status)status.textContent='Watchlist could not be saved in this browser, but this session still tracks watched items.';
  }
}
function setStatus(message,kind){
  const status=document.querySelector('#appStatus');
  if(!status)return;
  status.textContent=message;
  status.classList.toggle('error',kind==='error');
}
function updateFeedChrome(){
  const notice=document.querySelector('#dataNotice');
  if(notice){
    const heading=appFeed.mode==='demo'?'Public preview':appFeed.mode==='fixture'?'Staging fixture':'Customer feed';
    const body=String(appFeed.notice||'').replace(/^(Public preview|Staging fixture|Customer feed):\s*/i,'');
    notice.innerHTML=`<strong>${heading}:</strong> ${body}`;
  }
  const counts=deals.reduce((m,d)=>(m[d.dataState.kind]=(m[d.dataState.kind]||0)+1,m),{});
  const status=document.querySelector('#customerDataStatus');
  if(status)status.innerHTML=`<strong>${counts.live||0} live</strong><span>${counts.cached||0} cached</span><span>${counts.delayed||0} delayed</span><span>${counts.demo||0} demo</span><small>Validation-only and unauthorized rows stay hidden and cannot alert.</small>`;
  const countEl=document.querySelector('#metricOpportunityCount');
  const labelEl=document.querySelector('#metricOpportunityLabel');
  if(countEl)countEl.textContent=String(deals.length);
  if(labelEl)labelEl.textContent=appFeed.mode==='demo'?'Demo opportunities':appFeed.mode==='fixture'?'Fixture opportunities':'Feed opportunities';
  document.body.dataset.huntiqStatus=deals.length?'ready':evaluationErrors.length?'error':'empty';
  document.body.dataset.huntiqMode=appFeed.mode;
}
function detailsHtml(d){
  const qty=Math.max(1,Math.floor(Number(d.purchaseQuantity||d.requiredPurchaseQuantity||1)||1));
  const alertLine=d.alert&&d.alert.alert?'Alert eligible after live decision-floor checks':'Alerts suppressed — unauthorized, unverified, demo, cached, delayed, or feed-disabled rows cannot notify';
  if(!d.economicClaimsAuthorized){
    return `<strong>Resale evidence pending</strong><br>Current asking listings may be shown as market context, but they cannot establish sold-market value, profit, ROI, max buy, or a HUNTIQ Score. Verified completed-sale evidence and the full customer authority envelope are required.<div class="economics-explain"><strong>Retail observation only</strong><br>Modeled buy quantity: ${qty} · ${alertLine}.</div><small>No customer-facing economics were computed from active asking prices.</small>`;
  }
  return `<strong>Resale snapshot</strong><br>30-day median: ${money(d.comps.d30)} · 60-day: ${money(d.comps.d60)} · 90-day: ${money(d.comps.d90)} · ${d.dataOrigin==='demo'?'Demo sold':'Verified sold'}: ${d.comps.soldCount||0} · active listings: ${d.resale.activeListingCount??'n/a'}<br>Resale confidence: ${d.resale.resaleConfidence}% · liquidity: ${d.resale.liquidityScore}% · sell-through: ${d.resale.sellThroughRate??'n/a'}% · comp spread: ${d.resale.spreadPct}% · ask gap: ${d.resale.askGapPct}% · est. days to sell: ${d.resale.estimatedDaysToSell??'n/a'}<br>Resale uncertainty band: ${money(d.purchaseDecision.resaleBand.low)}–${money(d.purchaseDecision.resaleBand.high)} · band confidence ${d.purchaseDecision.resaleBand.confidence}% · Conservative value: ${money(d.resale.conservativeValue)} · Liquidation value: ${money(d.risk.liquidation.value)} (${d.risk.liquidation.haircutPct}% haircut)<br><strong>Safe max buy: ${money(d.purchaseDecision.maxBuyPrice)}</strong> for ≥${Math.round(d.purchaseDecision.targetRoi)}% ROI and ≥${money(d.purchaseDecision.minProfit)} profit · actual price ${money(d.price)} · headroom ${money(d.purchaseDecision.headroom)} (${Math.round(d.purchaseDecision.headroomPct)}%) · ${d.purchaseDecision.verdict}<br>Break-even resale: ${money(d.economics.breakEvenSalePrice)} · Base profit: ${money(d.economics.profit)} / ${Math.round(d.economics.roi)}% ROI · Downside profit: ${money(d.downsideEconomics.profit)} / ${Math.round(d.downsideEconomics.roi)}% ROI · Liquidation profit: ${money(d.risk.liquidation.economics.profit)} / ${Math.round(d.risk.liquidation.economics.roi)}% ROI<br>Risk-adjusted profit: ${money(d.riskAdjustedEconomics.profit)} · Risk-adjusted ROI: ${Math.round(d.riskAdjustedEconomics.roi)}% · Profit/day: ${d.capitalEfficiency.profitPerDay==null?'n/a':money(d.capitalEfficiency.profitPerDay)} · 30-day ROI equivalent: ${d.capitalEfficiency.roi30Equivalent==null?'n/a':Math.round(d.capitalEfficiency.roi30Equivalent)+'%'} · Capital score: ${d.capitalEfficiency.score}<br>Price-history coverage: ${d.historyAssessment.historyCoverageScore}% · observations: ${d.historyAssessment.uniqueObservationCount}/${d.historyAssessment.sampleCount} unique · median gap: ${d.historyAssessment.medianGapDays}d · max gap: ${d.historyAssessment.maxGapDays}d · history label: ${d.historyAssessment.label}<br>Price stability: ${d.risk.priceStability.stabilityScore}% (${d.risk.priceStability.label}) · historical MAD: ${d.risk.priceStability.madPct??'n/a'}% · range: ${d.risk.priceStability.rangePct??'n/a'}% · Evidence quality: ${Math.round(d.evidence.score*100)}% · freshness: ${Math.round(d.evidence.freshnessScore*100)}% · Markdown forecast: ${forecastText(d.penny.forecast)}<div class="economics-explain"><strong>Quantity, profit and downside</strong><br>Modeled buy quantity: ${qty} · Safe max buy is the highest price that still clears the profit/ROI floor after fees, shipping and conservative resale. Downside profit uses the weaker completed-sale window rather than the best-case sold median. ${alertLine}.</div><small>${d.dataOrigin==='demo'?'Engine-computed demo values only — not live marketplace data.':'Validated retailer observation; resale fields remain unavailable until verified sold evidence is supplied.'}</small>`;
}
function renderDeals(){
  const grid=document.querySelector('#dealGrid');
  if(!grid)return;
  grid.innerHTML='';
  const list=HuntIQCustomerAppBoundary.filterOpportunities(deals,{filter:active,query:searchQuery,watchIds:watch});
  list.forEach(d=>{
    const node=document.querySelector('#dealTemplate').content.cloneNode(true);
    const card=node.querySelector('.deal-card');
    card.dataset.dealId=d.id;
    card.dataset.dataKind=d.dataState.kind;
    node.querySelector('.retailer').textContent=d.retailer;
    const stateBadge=node.querySelector('.data-state-badge');
    stateBadge.textContent=d.dataState.label;
    stateBadge.classList.add(d.dataState.kind);
    stateBadge.title=`${d.dataState.label} · ${d.provenance.freshnessLabel} · ${d.provenance.locationLabel}`;
    node.querySelector('.badge').textContent=d.label;
    node.querySelector('h3').textContent=d.title;
    node.querySelector('.provenance').textContent=`${d.dataState.label} · ${d.provenance.freshnessLabel} · ${d.retailer} · ${d.provenance.locationLabel}`;
    node.querySelector('.current').textContent=money(d.price);
    node.querySelector('.reference').textContent=money(d.reference);
    node.querySelector('.drop').textContent=d.economicClaimsAuthorized?`${Math.round(d.anomaly.dropPct)}% below historical baseline · Max buy ${money(d.purchaseDecision.maxBuyPrice)} · ${d.purchaseDecision.verdict}`:'Retail price observed · verified resale and profit evidence pending';
    const ps=node.querySelector('.penny-signal');
    ps.textContent=d.retailer==='Home Depot'?`Penny Probability ${d.penny.score}% · ${d.penny.label} · ${forecastText(d.penny.forecast)} · Alert priority ${d.alert.priority}`:'';
    node.querySelector('.market').textContent=money(d.market);
    node.querySelector('.profit').textContent=money(d.profit);
    node.querySelector('.roi').textContent=percent(d.roi);
    node.querySelector('.flip').textContent=d.flip==null?'n/a':d.flip;
    const alertNote=d.alert.alert?' · Alert eligible':'';
    node.querySelector('.confidence span').textContent=d.economicClaimsAuthorized?`Anomaly ${d.confidence}%${d.rawConfidence!==d.confidence?` (raw ${d.rawConfidence}%)`:''} · History coverage ${d.historyAssessment.historyCoverageScore}% · Stability ${d.risk.priceStability.stabilityScore}% · Evidence ${Math.round(d.evidence.score*100)}% · Liquidity ${d.resale.liquidityScore}% · Resale band confidence ${d.purchaseDecision.resaleBand.confidence}%${alertNote}`:`Retail evidence ${Math.round(d.evidence.score*100)}% · sold-market economics withheld`;
    node.querySelector('.confidence i').style.width=`${d.confidence}%`;
    const panelId=`details-${d.id}`;
    const cp=node.querySelector('.comp-panel');
    cp.id=panelId;
    cp.innerHTML=detailsHtml(d);
    const wb=node.querySelector('.watch-btn');
    const watching=watch.has(d.id);
    wb.textContent=watching?'✓ Watching':'+ Watch';
    wb.setAttribute('aria-pressed',watching?'true':'false');
    wb.setAttribute('aria-label',watching?`Stop watching ${d.title}`:`Watch ${d.title}`);
    wb.addEventListener('click',()=>{watch.has(d.id)?watch.delete(d.id):watch.add(d.id);persistWatch();renderDeals();});
    const db=node.querySelector('.details-btn');
    db.setAttribute('aria-controls',panelId);
    db.addEventListener('click',()=>{const open=cp.hidden;cp.hidden=!open;db.setAttribute('aria-expanded',open?'true':'false');});
    grid.append(node);
  });
  if(!list.length){
    const empty=document.createElement('div');
    empty.className='panel empty-state';
    empty.id='emptyState';
    empty.textContent=deals.length?'No matching opportunities yet.':'No customer-visible opportunities in this feed.';
    grid.append(empty);
  }
  const visibleCount=list.length;
  if(evaluationErrors.length&&!deals.length)setStatus('HUNTIQ could not evaluate this feed. The app stayed online without live provider calls.','error');
  else if(!deals.length)setStatus('No customer-visible opportunities. Validation-only and unauthorized rows are hidden.');
  else if(!visibleCount)setStatus('No matching opportunities for this filter or search.');
  else setStatus(`${visibleCount} labeled ${appFeed.mode==='demo'?'demo':appFeed.mode} opportunit${visibleCount===1?'y':'ies'} · ${appFeed.source}.`);
}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
  btn.classList.add('active');
  btn.setAttribute('aria-pressed','true');
  active=btn.dataset.filter;
  renderDeals();
}));
const search=document.querySelector('#dealSearch');
if(search)search.addEventListener('input',()=>{searchQuery=search.value||'';renderDeals();});
const sourceGrid=document.querySelector('#sourceGrid');
if(sourceGrid)sources.forEach(s=>{const el=document.createElement('article');el.className='source-card';el.innerHTML=`<h3>${s.name}</h3><p>${s.detail}</p><span class="status ${s.class}">${s.status}</span>`;sourceGrid.append(el);});
const year=document.querySelector('#year');
if(year)year.textContent=new Date().getFullYear();
function syncOfflineBanner(force){
  const banner=document.querySelector('#offlineBanner');
  if(!banner)return;
  if(force==='offline'){banner.hidden=false;document.body.dataset.huntiqOffline='1';return;}
  if(force==='online'){banner.hidden=true;document.body.dataset.huntiqOffline='0';return;}
  if(document.body.dataset.huntiqOffline==='1'||navigator.onLine===false){banner.hidden=false;return;}
  banner.hidden=true;
}
window.addEventListener('online',()=>syncOfflineBanner('online'));
window.addEventListener('offline',()=>syncOfflineBanner('offline'));
syncOfflineBanner();
updateFeedChrome();
renderDeals();
void suppliedDeals;
Promise.all(deals.map(async d=>{const demo=d.dataOrigin==='demo';const historyReady=demo||d.liveReadiness?.historyDisposition==='validated-history';if(!historyReady)return;const identity=evidenceIdentity(d);const snapshot={retailer:d.retailer,sku:d.sku,storeId:d.storeId||'online',price:d.price,inventory:null,observedAt:d.observedAt,source:demo?'demo-current':identity.source,verified:identity.verified,evidenceQuality:d.evidence.score};await HuntIQHistory.saveObservation(snapshot).catch(()=>null);await HuntIQSnapshots.saveSnapshot(snapshot).catch(()=>null);const events=HuntIQMarkdown.detectMarkdownEvents(d.timeline);const latestEvent=events[events.length-1];if(latestEvent)await HuntIQHistory.saveMarkdownEvent({retailer:d.retailer,sku:d.sku,storeId:d.storeId||'online',...latestEvent,source:demo?'demo-derived':identity.source,verified:identity.verified,evidenceQuality:d.evidence.score}).catch(()=>null);})).catch(()=>{});
let deferredPrompt;const installBtn=document.querySelector('#installBtn');
if(installBtn){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
  installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true;});
}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
