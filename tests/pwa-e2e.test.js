'use strict';
const assert=require('assert');
const {startStaticServer,findChrome,launchChrome,openPage,closeChrome,waitUntil}=require('./helpers/chrome-session');

function pageErrors(page){
  const consoleErrors=page.console.filter(entry=>entry.type==='error'||entry.type==='assert');
  return [...page.exceptions,...consoleErrors.map(entry=>entry.text)];
}

(async()=>{
  const chromePath=findChrome();
  if(!chromePath){
    console.error('Chrome is required for HUNTIQ PWA E2E tests');
    process.exitCode=1;
    return;
  }
  const {server,origin}=await startStaticServer();
  const session=await launchChrome();
  try{
    const demo=await openPage(session,origin);
    const demoState=await demo.evaluate(`({
      status:document.body.dataset.huntiqStatus,
      mode:document.body.dataset.huntiqMode,
      titles:[...document.querySelectorAll('.deal-card h3')].map(el=>el.textContent),
      provenance:[...document.querySelectorAll('.provenance')].map(el=>el.textContent),
      badges:[...document.querySelectorAll('.data-state-badge')].map(el=>el.textContent),
      searchLabel:document.querySelector('label[for="dealSearch"]').textContent,
      skip:document.querySelector('.skip-link').textContent,
      lang:document.documentElement.lang,
      overflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1
    })`);
    assert.equal(demoState.mode,'demo');
    assert(demoState.titles.length>=1,'demo fallback should render opportunities');
    assert(demoState.badges.every(label=>label==='DEMO DATA'));
    assert(demoState.provenance.every(text=>/DEMO DATA/.test(text)));
    assert(demoState.provenance.every(text=>/Home Depot|Best Buy|Lowe's/.test(text)));
    assert.equal(demoState.lang,'en');
    assert.equal(demoState.overflow,true);
    assert.deepEqual(pageErrors(demo),[]);

    await demo.evaluate(`document.querySelector('[data-filter="watch"]').click()`);
    const empty=await demo.evaluate(`document.querySelector('#emptyState')&&document.querySelector('#emptyState').textContent`);
    assert.match(empty,/No matching opportunities/);

    await demo.evaluate(`document.querySelector('[data-filter="all"]').click()`);
    await demo.evaluate(`document.querySelector('.details-btn').click()`);
    const details=await demo.evaluate(`({
      expanded:document.querySelector('.details-btn').getAttribute('aria-expanded'),
      hidden:document.querySelector('.comp-panel').hidden,
      economics:document.querySelector('.economics-explain').textContent,
      pressed:document.querySelector('[data-filter="all"]').getAttribute('aria-pressed')
    })`);
    assert.equal(details.expanded,'true');
    assert.equal(details.hidden,false);
    assert.match(details.economics,/Downside profit/);
    assert.equal(details.pressed,'true');
    await demo.evaluate(`document.querySelector('.details-btn').click()`);
    assert.equal(await demo.evaluate(`document.querySelector('.details-btn').getAttribute('aria-expanded')`),'false');

    const firstTitle=await demo.evaluate(`document.querySelector('.deal-card h3').textContent`);
    await demo.evaluate(`document.querySelector('.watch-btn').click()`);
    assert.equal(await demo.evaluate(`document.querySelector('.watch-btn').getAttribute('aria-pressed')`),'true');
    await demo.send('Page.reload',{ignoreCache:false});
    await waitUntil(demo,'Boolean(document.body&&document.body.dataset.huntiqStatus&&document.body.dataset.huntiqStatus!=="loading")');
    const watched=await demo.evaluate(`({
      title:document.querySelector('.deal-card h3').textContent,
      pressed:document.querySelector('.watch-btn').getAttribute('aria-pressed'),
      label:document.querySelector('.watch-btn').textContent
    })`);
    assert.equal(watched.title,firstTitle);
    assert.equal(watched.pressed,'true');
    assert.match(watched.label,/Watching/);

    const corrupt=await openPage(session,origin,{beforeLoad:`localStorage.setItem('huntiq_watchlist_v1','{not-json'); sessionStorage.setItem('huntiq_watchlist_v1','{"nope":true}');`});
    const recovered=await corrupt.evaluate(`({
      status:document.body.dataset.huntiqStatus,
      cards:document.querySelectorAll('.deal-card').length,
      errors:[...performance.getEntriesByType('resource')].length
    })`);
    assert.notEqual(recovered.status,'loading');
    assert(recovered.cards>=1,'corrupt storage must not brick startup');
    assert.deepEqual(pageErrors(corrupt),[]);

    const fixture=await openPage(session,`${origin}/?huntiq-mode=fixture`);
    const fixtureState=await fixture.evaluate(`({
      mode:document.body.dataset.huntiqMode,
      titles:[...document.querySelectorAll('.deal-card h3')].map(el=>el.textContent),
      provenance:[...document.querySelectorAll('.provenance')].map(el=>el.textContent),
      kinds:[...document.querySelectorAll('.deal-card')].map(el=>el.dataset.dataKind),
      html:document.body.innerText
    })`);
    assert.equal(fixtureState.mode,'fixture');
    assert(fixtureState.titles.includes('Fixture Live Drill'));
    assert(fixtureState.titles.includes('Fixture Cached Fan'));
    assert(fixtureState.titles.includes('Fixture Delayed Light'));
    assert(fixtureState.titles.includes('Fixture Demo Saw'));
    assert(!fixtureState.titles.includes('Hidden Shadow SKU'));
    assert(!fixtureState.titles.includes('Unauthorized Live TV'));
    assert(fixtureState.kinds.includes('live'));
    assert(fixtureState.kinds.includes('cached'));
    assert(fixtureState.kinds.includes('delayed'));
    assert(fixtureState.kinds.includes('demo'));
    assert(fixtureState.provenance.some(text=>/LIVE/.test(text)&&/ZIP 18360/.test(text)));
    assert(!/Alert eligible after live decision-floor/.test(fixtureState.html)||fixtureState.kinds.includes('live'));
    const demoAlert=await fixture.evaluate(`([...document.querySelectorAll('.deal-card')].find(card=>card.querySelector('h3').textContent==='Fixture Demo Saw').textContent)`);
    assert(!/ · Alert eligible/.test(demoAlert),'demo rows cannot display live alert eligibility');
    assert.deepEqual(pageErrors(fixture),[]);

    await fixture.evaluate(`document.querySelector('#dealSearch').value='drill'; document.querySelector('#dealSearch').dispatchEvent(new Event('input',{bubbles:true}));`);
    const searched=await fixture.evaluate(`[...document.querySelectorAll('.deal-card h3')].map(el=>el.textContent)`);
    assert.deepEqual(searched,['Fixture Live Drill']);

    const supplied=await openPage(session,origin,{beforeLoad:`
      globalThis.HUNTIQ_CUSTOMER_FEED={
        generatedAt:'2026-09-07T12:00:00.000Z',
        alertsEnabled:false,
        dataState:'customer-live',
        opportunities:[{
          id:'supplied-live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',
          retailer:'Home Depot',title:'Supplied Normalized Saw',sku:'HD-SUPPLIED',storeId:'1836',zip:'18360',channel:'store',
          price:139,referencePrice:249,priceHistory:[249,239,229,219,209,199,189,179],
          comps:{d30:189,d60:185,d90:179,soldCount:8,soldWindowDays:90,activeListingCount:4,currentAsks:[199],authoritative:true},
          feeRate:.135,shipping:18,taxRate:.06,dataQuality:.97,holdingCostPerDay:.1,
          source:{provider:'retailerapi',providerRecordId:'supplied-1',validationState:'validated',dataState:'live',retrievedAt:'2026-09-07T11:05:00.000Z',rightsClass:'licensed-customer-display',retentionPolicy:'contract-defined',redistributionAllowed:true},
          evidenceAuthority:{historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true},
          customerAlertEligible:false
        }]
      };
    `});
    const suppliedState=await supplied.evaluate(`({
      mode:document.body.dataset.huntiqMode,
      titles:[...document.querySelectorAll('.deal-card h3')].map(el=>el.textContent),
      provenance:document.querySelector('.provenance').textContent
    })`);
    assert.equal(suppliedState.mode,'customer');
    assert.deepEqual(suppliedState.titles,['Supplied Normalized Saw']);
    assert.match(suppliedState.provenance,/LIVE/);
    assert.match(suppliedState.provenance,/ZIP 18360/);
    assert.deepEqual(pageErrors(supplied),[]);

    const asksOnly=await openPage(session,origin,{beforeLoad:`
      globalThis.HUNTIQ_CUSTOMER_FEED={
        generatedAt:'2026-09-07T12:00:00.000Z',
        alertsEnabled:true,
        dataState:'customer-live',
        opportunities:[{
          id:'asks-only-live',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',
          retailer:'Home Depot',title:'Asks Only Live Item',productId:'ASKS-ONLY',sku:'ASKS-ONLY',
          storeId:'1836',zip:'18360',channel:'local',price:25,referencePrice:50,
          priceHistoryObservations:[
            {retailer:'Home Depot',productId:'ASKS-ONLY',storeId:'1836',zip:'18360',channel:'local',price:50,observedAt:'2026-09-01T11:00:00.000Z',verified:true},
            {retailer:'Home Depot',productId:'ASKS-ONLY',storeId:'9999',zip:'18360',channel:'local',price:1,observedAt:'2026-09-02T11:00:00.000Z',verified:true}
          ],
          comps:{currentAsks:[999],activeListingCount:1,authoritative:false},
          completedSales:[],
          feeRate:.135,shipping:8,taxRate:.06,dataQuality:.97,
          source:{provider:'retailerapi',providerRecordId:'asks-only-1',validationState:'validated',dataState:'live',retrievedAt:'2026-09-07T11:05:00.000Z',rightsClass:'licensed-customer-display',retentionPolicy:'contract-defined',redistributionAllowed:true},
          evidenceAuthority:{historyAuthoritative:true,anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true},
          liveReadiness:{alertEligible:true},customerAlertEligible:true,alert:{alert:true}
        }]
      };
    `});
    const asksOnlyState=await asksOnly.evaluate(`({
      title:document.querySelector('.deal-card h3').textContent,
      market:document.querySelector('.market').textContent,
      profit:document.querySelector('.profit').textContent,
      roi:document.querySelector('.roi').textContent,
      score:document.querySelector('.flip').textContent,
      card:document.querySelector('.deal-card').textContent
    })`);
    assert.equal(asksOnlyState.title,'Asks Only Live Item');
    assert.equal(asksOnlyState.market,'n/a');
    assert.equal(asksOnlyState.profit,'n/a');
    assert.equal(asksOnlyState.roi,'n/a');
    assert.equal(asksOnlyState.score,'n/a');
    assert(!/Alert eligible/.test(asksOnlyState.card));
    assert.deepEqual(pageErrors(asksOnly),[]);

    await demo.send('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});
    await demo.send('Page.navigate',{url:origin});
    await waitUntil(demo,'Boolean(document.body&&document.body.dataset.huntiqStatus&&document.body.dataset.huntiqStatus!=="loading")');
    for(const width of [320,360,390,1280]){
      await demo.send('Emulation.setDeviceMetricsOverride',{width,height:width===1280?800:720,deviceScaleFactor:1,mobile:width<800});
      const overflow=await demo.evaluate(`document.documentElement.scrollWidth<=document.documentElement.clientWidth+1`);
      assert.equal(overflow,true,`no horizontal overflow at ${width}px`);
    }

    await demo.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    const motion=await demo.evaluate(`getComputedStyle(document.documentElement).scrollBehavior`);
    assert.equal(motion,'auto');

    await demo.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await demo.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    const focused=await demo.evaluate(`({tag:document.activeElement.tagName,className:document.activeElement.className,outline:getComputedStyle(document.activeElement).outlineStyle})`);
    assert.equal(focused.tag,'A');
    assert.match(focused.className,/skip-link|brand/);

    const manifest=await demo.evaluate(`({href:document.querySelector('link[rel="manifest"]').getAttribute('href'),sw:'serviceWorker' in navigator})`);
    assert.equal(manifest.href,'./manifest.webmanifest');
    assert.equal(manifest.sw,true);
    const manifestJson=await fetch(`${origin}/manifest.webmanifest`).then(res=>res.json());
    assert.equal(manifestJson.display,'standalone');
    assert.ok(manifestJson.icons.length>=1);

    await waitUntil(demo,'navigator.serviceWorker.ready.then(reg=>Boolean(reg&&reg.active))',20000);
    const swOffline=await demo.evaluate(`fetch('./missing-e2e-asset.css').then(res=>res.status).catch(()=>null)`);
    // without SW intercept this is HTTP 404 from the test server
    assert.equal(swOffline,404);

    await demo.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    await demo.send('Page.reload',{ignoreCache:false});
    await waitUntil(demo,'Boolean(document.body&&document.querySelector(".brand"))',20000);
    await demo.evaluate('window.dispatchEvent(new Event("offline"))');
    await waitUntil(demo,'Boolean(document.querySelector("#offlineBanner")&&!document.querySelector("#offlineBanner").hidden)',10000);
    const offlineState=await demo.evaluate(`({
      brand:document.querySelector('.brand strong')&&document.querySelector('.brand strong').textContent,
      banner:document.querySelector('#offlineBanner')&&!document.querySelector('#offlineBanner').hidden,
      cards:document.querySelectorAll('.deal-card').length,
      online:navigator.onLine,
      status:document.body.dataset.huntiqStatus
    })`);
    assert.equal(offlineState.brand,'HUNTIQ');
    assert.equal(offlineState.banner,true,'offline banner should appear when the offline event fires');
    assert(offlineState.cards>=1,'offline reload must keep labeled opportunities');
    assert.deepEqual(pageErrors(demo).filter(text=>!/Failed to load|net::ERR_INTERNET_DISCONNECTED|Failed to fetch/i.test(text)),[]);

    console.log('pwa e2e tests passed');
  }finally{
    await closeChrome(session);
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{
  console.error(err);
  process.exitCode=1;
});
