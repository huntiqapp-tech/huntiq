(function(root,factory){
  const api=factory(root.HuntIQDataState);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQCustomerAppBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(DataState){
'use strict';

const HOUR=36e5;
const REQUIRED_CUSTOMER_AUTHORITIES=[
  'historyAuthoritative','anomalyAuthoritative','marketComparisonAuthoritative',
  'profitRoiAuthoritative','notificationAuthoritative'
];
const clean=value=>value==null?'':String(value).trim();
const lower=value=>clean(value).toLowerCase();

function dataStateApi(){
  if(DataState)return DataState;
  if(typeof module==='object'&&module.exports)return require('./pwa-data-state');
  return globalThis.HuntIQDataState;
}

function detectAppMode({search='',hash='',globalObject=globalThis}={}){
  const supplied=lower(globalObject&&globalObject.HUNTIQ_APP_MODE);
  if(supplied==='fixture'||supplied==='staging')return 'fixture';
  if(supplied==='demo')return 'demo';
  if(supplied==='customer'||supplied==='live'||supplied==='production')return 'customer';
  const params=new URLSearchParams(String(search||'').replace(/^\?/,''));
  const query=lower(params.get('huntiq-mode')||'');
  if(query==='fixture')return 'fixture';
  if(query==='demo')return 'demo';
  return 'default';
}

function readSuppliedFeed(globalObject=globalThis){
  const envelope=globalObject&&globalObject.HUNTIQ_CUSTOMER_FEED;
  if(envelope&&typeof envelope==='object'&&!Array.isArray(envelope)){
    const opportunities=Array.isArray(envelope.opportunities)?envelope.opportunities
      :Array.isArray(envelope.records)?envelope.records
      :Array.isArray(envelope.items)?envelope.items
      :[];
    return{
      present:opportunities.length>0||Array.isArray(envelope.opportunities),
      generatedAt:envelope.generatedAt||envelope.asOf||null,
      validatedAt:envelope.validatedAt||null,
      provider:envelope.provider||null,
      dataState:envelope.dataState||'customer-live',
      alertsEnabled:envelope.alertsEnabled===true,
      opportunities,
      rejected:Array.isArray(envelope.rejected)?envelope.rejected:[]
    };
  }
  const list=globalObject&&globalObject.HUNTIQ_CUSTOMER_OPPORTUNITIES;
  if(Array.isArray(list)){
    return{
      present:true,
      generatedAt:null,
      validatedAt:null,
      provider:null,
      dataState:'customer-live',
      alertsEnabled:false,
      opportunities:list,
      rejected:[]
    };
  }
  return{present:false,generatedAt:null,validatedAt:null,provider:null,dataState:null,alertsEnabled:false,opportunities:[],rejected:[]};
}

function locationLabel(row={}){
  const zip=clean(row.zip||row.zipcode||row.postalCode);
  const store=clean(row.storeId||row.store_id||row.locationId);
  const channel=clean(row.channel)||'online';
  const parts=[];
  if(store&&store!=='online')parts.push(`Store ${store}`);
  if(zip)parts.push(`ZIP ${zip}`);
  parts.push(channel);
  return parts.join(' · ');
}

function freshnessLabel(ageHours){
  if(ageHours==null||!Number.isFinite(Number(ageHours)))return 'Freshness unknown';
  const hours=Math.max(0,Number(ageHours));
  if(hours<1)return `Observed ${Math.max(1,Math.round(hours*60))}m ago`;
  if(hours<48)return `Observed ${Math.round(hours)}h ago`;
  return `Observed ${Math.round(hours/24)}d ago`;
}

function coerceIncoming(row={}, {fromDemoFallback=false}={}){
  if(!row||typeof row!=='object'||Array.isArray(row))return null;
  const copy={...row};
  if(fromDemoFallback){
    const origin=lower(copy.dataOrigin||copy.dataState);
    if(origin!=='demo'&&origin!=='demonstration'){
      copy.dataOrigin='validation-only';
      copy.validationState='unvalidated';
      return copy;
    }
    copy.dataOrigin='demo';
    copy.validationState=copy.validationState||'demo';
    return copy;
  }
  const requested=lower(copy.dataOrigin||copy.dataState||(copy.source&&copy.source.dataState));
  if(!requested){
    copy.dataOrigin='validation-only';
    copy.validationState=copy.validationState||'unvalidated';
  }
  return copy;
}

function suppressUnauthorizedAlert(row,dataState,alertsEnabled){
  const authority=row&&row.evidenceAuthority||{};
  const allowed=dataState.kind==='live'&&dataState.alertEligible===true&&alertsEnabled===true&&
    row.customerAlertEligible===true&&row.liveReadiness&&row.liveReadiness.alertEligible===true&&
    authority.notificationAuthoritative===true&&authority.profitRoiAuthoritative===true;
  const previous=row.alert&&typeof row.alert==='object'?row.alert:{};
  if(allowed)return{...previous,alert:previous.alert===true,priority:previous.priority||'standard'};
  const blockers=[...new Set([...(previous.blockers||[]),dataState.reason||'customer-data-state','unauthorized-or-unverified-alert'])];
  return{...previous,alert:false,priority:'suppressed',blockers};
}

function presentProvenance(row,dataState){
  const retailer=clean(row.retailer)||'Unknown retailer';
  const channel=clean(row.channel)||'online';
  return{
    kind:dataState.kind,
    label:dataState.label,
    reason:dataState.reason||null,
    ageHours:dataState.ageHours,
    freshnessLabel:dataState.kind==='demo'?'Demonstration catalog':freshnessLabel(dataState.ageHours),
    retailer,
    channel,
    storeId:clean(row.storeId||row.store_id)||(channel==='online'?'online':''),
    zip:clean(row.zip||row.zipcode||row.postalCode),
    locationLabel:locationLabel(row),
    observedAt:row.observedAt||row.timestamp||null
  };
}

function classifyRow(row,options){
  const api=dataStateApi();
  if(api&&typeof api.classifyOpportunityData==='function')return api.classifyOpportunityData(row,options);
  return{kind:'validation',label:'WITHHELD',customerVisible:false,alertEligible:false,ageHours:null,reason:'classification-unavailable'};
}

function independentCustomerVisibility(row={},dataState={}){
  const origin=lower(row.dataOrigin||(row.source&&row.source.dataState));
  if(dataState.kind==='demo'){
    return origin==='demo'||origin==='demonstration'
      ?{allowed:true,reason:null}
      :{allowed:false,reason:'demo-origin-mismatch'};
  }
  if(dataState.customerVisible!==true)return{allowed:false,reason:dataState.reason||'classifier-withheld'};
  if(origin!=='live'&&origin!=='cached')return{allowed:false,reason:'customer-origin-not-authorized'};
  if(lower(row.validationState||(row.source&&row.source.validationState))!=='validated'){
    return{allowed:false,reason:'customer-validation-missing'};
  }
  const authority=row.evidenceAuthority;
  if(!authority||typeof authority!=='object'||Array.isArray(authority)){
    return{allowed:false,reason:'customer-authority-missing'};
  }
  const missing=REQUIRED_CUSTOMER_AUTHORITIES.filter(name=>authority[name]!==true);
  if(missing.length)return{allowed:false,reason:`customer-authority-incomplete:${missing.join(',')}`};
  if(!['live','cached','delayed'].includes(dataState.kind))return{allowed:false,reason:'customer-data-state-invalid'};
  return{allowed:true,reason:null};
}

function revalidateCustomerDataState(row={},options={}){
  const classified=classifyRow(row,options);
  const check=independentCustomerVisibility(row,classified);
  if(check.allowed)return classified;
  return{
    kind:'validation',label:'WITHHELD',customerVisible:false,alertEligible:false,
    ageHours:classified&&classified.ageHours!=null?classified.ageHours:null,
    reason:check.reason
  };
}

function productIdentity(row={}){
  return clean(row.productId||row.product_id||row.sku||row.upc||row.modelNumber||row.model_number);
}

function normalizedChannel(value){
  const channel=lower(value);
  return channel==='store'||channel==='local'?'local':'online';
}

function historyScope(row={}){
  const retailer=lower(row.retailer);
  const product=lower(productIdentity(row));
  const channel=normalizedChannel(row.channel);
  const store=clean(row.storeId||row.store_id);
  const zip=clean(row.zip||row.zipcode||row.postalCode);
  const location=channel==='online'?'online':store?'store:'+lower(store):zip?'zip:'+lower(zip):'';
  return{retailer,product,channel,location,key:[retailer,product,channel,location].join('|')};
}

function filterHistoryObservations(deal={},rows=[],{before=null}={}){
  const target=historyScope(deal);
  if(!target.retailer||!target.product||!target.location||!Array.isArray(rows))return[];
  const cutoff=Date.parse(before);
  return rows.filter(row=>{
    if(!row||typeof row!=='object'||Array.isArray(row))return false;
    const scope=historyScope(row);
    const observed=Date.parse(row.observedAt||row.timestamp);
    return scope.key===target.key&&Number.isFinite(Number(row.price))&&Number(row.price)>0&&
      Number.isFinite(observed)&&(!Number.isFinite(cutoff)||observed<cutoff)&&row.verified===true;
  });
}

function authorizedCompsForEconomics(row={}){
  const comps=row.comps&&typeof row.comps==='object'?row.comps:{};
  if(lower(row.dataOrigin)==='demo')return comps;
  const authority=row.evidenceAuthority||{};
  const sales=Array.isArray(row.completedSales)?row.completedSales.filter(sale=>
    sale&&sale.verified===true&&['sold','completed','fulfilled'].includes(lower(sale.status))&&
    Number.isFinite(Number(sale.price))&&Number(sale.price)>0
  ):[];
  const soldWindows=['d30','d60','d90'].filter(key=>Number.isFinite(Number(comps[key]))&&Number(comps[key])>0);
  const authorized=authority.marketComparisonAuthoritative===true&&comps.authoritative===true&&sales.length>=3&&soldWindows.length>0;
  if(authorized)return comps;
  return{...comps,d30:null,d60:null,d90:null,soldCount:0,soldWindowDays:null,currentAsks:[],authoritative:false};
}

function customerEconomicsAuthorized(row={}){
  if(lower(row.dataOrigin)==='demo')return true;
  const authority=row.evidenceAuthority||{};
  const comps=authorizedCompsForEconomics(row);
  return authority.marketComparisonAuthoritative===true&&authority.profitRoiAuthoritative===true&&comps.authoritative===true;
}

function selectVisibleOpportunities(opportunities=[], {asOf=new Date().toISOString(),alertsEnabled=false,fromDemoFallback=false}={}){
  const visible=[],hidden=[];
  for(const raw of opportunities){
    const row=coerceIncoming(raw,{fromDemoFallback});
    if(!row)continue;
    const dataState=revalidateCustomerDataState(row,{asOf});
    const provenance=presentProvenance(row,dataState);
    const next={...row,dataState,provenance,alert:suppressUnauthorizedAlert(row,dataState,alertsEnabled)};
    if(!dataState.customerVisible)hidden.push(next);
    else visible.push(next);
  }
  return{visible,hidden};
}

function resolveCustomerAppFeed({
  globalObject=globalThis,
  location=typeof globalThis.location!=='undefined'?globalThis.location:{},
  demoOpportunities=[],
  fixtureFeed=null,
  asOf=new Date().toISOString()
}={}){
  const mode=detectAppMode({search:location.search,hash:location.hash,globalObject});
  if(mode==='fixture'){
    const feed=fixtureFeed||(globalObject&&globalObject.HuntIQCustomerFeedFixture&&globalObject.HuntIQCustomerFeedFixture.feed())||{opportunities:[],generatedAt:asOf,dataState:'fixture',alertsEnabled:false};
    const clock=feed.generatedAt||feed.asOf||asOf;
    const selected=selectVisibleOpportunities(feed.opportunities||[],{asOf:clock,alertsEnabled:feed.alertsEnabled===true,fromDemoFallback:false});
    return{
      mode:'fixture',
      source:'fixture',
      asOf:clock,
      alertsEnabled:false,
      notice:'Staging fixture: deterministic labeled data for tests. Not a live retailer feed.',
      provider:feed.provider||'fixture',
      rejected:feed.rejected||[],
      ...selected
    };
  }

  const supplied=readSuppliedFeed(globalObject);
  if(mode!=='demo'&&supplied.present&&lower(supplied.dataState)==='customer-live'){
    const clock=supplied.generatedAt||asOf;
    const selected=selectVisibleOpportunities(supplied.opportunities,{asOf:clock,alertsEnabled:supplied.alertsEnabled===true,fromDemoFallback:false});
    if(selected.visible.length){
      return{
        mode:'customer',
        source:'server-owned-customer-feed',
        asOf:clock,
        alertsEnabled:supplied.alertsEnabled===true,
        notice:'Customer feed from the server-owned payload. Each card shows live, cached, delayed, or demo provenance. This browser never calls retailer providers.',
        provider:supplied.provider,
        rejected:supplied.rejected,
        ...selected
      };
    }
  }

  const selected=selectVisibleOpportunities(demoOpportunities,{asOf,alertsEnabled:false,fromDemoFallback:true});
  return{
    mode:'demo',
    source:'demo-fallback',
    asOf,
    alertsEnabled:false,
    notice:'Public preview: opportunities shown below are demonstration data until a rights-cleared customer feed is injected by the server.',
    provider:null,
    rejected:[],
    ...selected
  };
}

function matchesQuery(row,query){
  const q=lower(query);
  if(!q)return true;
  const haystack=[row.title,row.retailer,row.sku,row.productId,row.storeId,row.zip,row.channel,row.provenance&&row.provenance.locationLabel].map(lower).join(' ');
  return haystack.includes(q);
}

function filterOpportunities(rows=[], {filter='all',query='',watchIds=new Set()}={}){
  const active=lower(filter||'all');
  return rows.filter(row=>{
    if(!matchesQuery(row,query))return false;
    if(active==='all'||!active)return true;
    if(['live','demo','cached','delayed'].includes(active))return (row.dataState&&row.dataState.kind)===active;
    if(active==='watch')return watchIds.has(row.id);
    if(active==='penny')return row.retailer==='Home Depot'&&Number(row.penny&&row.penny.score)>=45;
    return row.type===active;
  });
}

return{
  HOUR,REQUIRED_CUSTOMER_AUTHORITIES,detectAppMode,readSuppliedFeed,coerceIncoming,locationLabel,freshnessLabel,
  presentProvenance,selectVisibleOpportunities,resolveCustomerAppFeed,filterOpportunities,
  suppressUnauthorizedAlert,matchesQuery,productIdentity,historyScope,filterHistoryObservations,
  authorizedCompsForEconomics,customerEconomicsAuthorized,independentCustomerVisibility,
  revalidateCustomerDataState
};
});
