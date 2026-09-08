(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQCustomerFeedFixture=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const asOf='2026-09-07T12:00:00.000Z';
const authority={
  historyAuthoritative:true,
  anomalyAuthoritative:true,
  marketComparisonAuthoritative:true,
  profitRoiAuthoritative:true,
  notificationAuthoritative:true
};

function liveSource(id){
  return{
    provider:'retailerapi',
    providerRecordId:id,
    providerStatus:'ok',
    retrievedAt:'2026-09-07T11:05:00.000Z',
    validationState:'validated',
    dataState:'live',
    rightsClass:'licensed-customer-display',
    retentionPolicy:'contract-defined',
    redistributionAllowed:true
  };
}

function history(prices, sku, observedEnd){
  const end=Date.parse(observedEnd);
  const step=7*24*36e5;
  return prices.map((price,i)=>({
    productId:sku,price,observedAt:new Date(end-step*(prices.length-i)).toISOString(),
    retailer:'Home Depot',storeId:'1836',channel:'store',source:'retailerapi',verified:true
  }));
}

function sales(sku){
  return [
    {productId:sku,status:'sold',price:189,soldAt:'2026-09-06T12:00:00.000Z',matchScore:98,sourceConfidence:97,evidenceClass:'completed_sale',verified:true},
    {productId:sku,status:'completed',price:185,soldAt:'2026-09-04T12:00:00.000Z',matchScore:96,sourceConfidence:95,evidenceClass:'completed_sale',verified:true},
    {productId:sku,status:'fulfilled',price:179,soldAt:'2026-09-01T12:00:00.000Z',matchScore:94,sourceConfidence:93,evidenceClass:'completed_sale',verified:true}
  ];
}

function feed(){
  const liveHistory=history([249,249,239,229,219,209,199,189], 'HD-FIX-DRILL', '2026-09-07T11:00:00.000Z');
  const cachedHistory=history([120,118,118,115,112,110,108,99], 'HD-FIX-CACHED', '2026-09-06T22:00:00.000Z');
  const delayedHistory=history([80,80,78,78,76,74,72,69], 'HD-FIX-DELAYED', '2026-09-04T12:00:00.000Z');
  return{
    generatedAt:asOf,
    validatedAt:'2026-09-07T11:30:00.000Z',
    provider:'retailerapi',
    dataState:'fixture',
    alertsEnabled:false,
    rejected:[{providerRecordId:'shadow-row',reason:'validation-only'}],
    opportunities:[
      {
        id:'fix-live-drill',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',
        retailer:'Home Depot',title:'Fixture Live Drill',sku:'HD-FIX-DRILL',productId:'HD-FIX-DRILL',
        storeId:'1836',zip:'18360',channel:'store',price:129,referencePrice:249,
        priceHistory:liveHistory.map(row=>row.price),priceHistoryObservations:liveHistory,
        comps:{d30:189,d60:185,d90:179,soldCount:3,soldWindowDays:90,activeListingCount:8,currentAsks:[199,189,195],authoritative:true,aggregateVerified:true},
        completedSales:sales('HD-FIX-DRILL'),feeRate:.135,shipping:18,taxRate:.06,dataQuality:.98,holdingCostPerDay:.12,
        source:liveSource('live-drill'),evidenceAuthority:authority,customerAlertEligible:false,
        liveReadiness:{historyDisposition:'validated-history',historyReady:true,alertEligible:false}
      },
      {
        id:'fix-cached-fan',dataOrigin:'cached',validationState:'validated',observedAt:'2026-09-06T22:00:00.000Z',
        retailer:'Home Depot',title:'Fixture Cached Fan',sku:'HD-FIX-CACHED',productId:'HD-FIX-CACHED',
        storeId:'1836',zip:'18360',channel:'store',price:79,referencePrice:120,
        priceHistory:cachedHistory.map(row=>row.price),priceHistoryObservations:cachedHistory,
        comps:{d30:110,d60:108,d90:99,soldCount:3,soldWindowDays:90,activeListingCount:6,currentAsks:[119,109],authoritative:true,aggregateVerified:true},
        completedSales:sales('HD-FIX-CACHED').map(row=>({...row,productId:'HD-FIX-CACHED',price:row.price-70})),
        feeRate:.135,shipping:14,taxRate:.06,dataQuality:.94,holdingCostPerDay:.08,
        source:{...liveSource('cached-fan'),retrievedAt:'2026-09-06T22:05:00.000Z',dataState:'cached'},
        evidenceAuthority:authority,customerAlertEligible:false,
        liveReadiness:{historyDisposition:'validated-history',historyReady:true,alertEligible:false}
      },
      {
        id:'fix-delayed-light',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-04T12:00:00.000Z',
        retailer:"Lowe's",title:'Fixture Delayed Light',sku:'LOWES-FIX-DELAYED',productId:'LOWES-FIX-DELAYED',
        storeId:'online',zip:'18018',channel:'online',price:49,referencePrice:80,
        priceHistory:delayedHistory.map(row=>row.price),priceHistoryObservations:delayedHistory.map(row=>({...row,retailer:"Lowe's",storeId:'online',channel:'online'})),
        comps:{d30:72,d60:70,d90:69,soldCount:3,soldWindowDays:90,activeListingCount:4,currentAsks:[74,71],authoritative:true,aggregateVerified:true},
        completedSales:sales('LOWES-FIX-DELAYED').map(row=>({...row,productId:'LOWES-FIX-DELAYED',price:row.price-110})),
        feeRate:.135,shipping:12,taxRate:.06,dataQuality:.9,holdingCostPerDay:.05,
        source:{...liveSource('delayed-light'),retrievedAt:'2026-09-04T12:05:00.000Z',dataState:'delayed'},
        evidenceAuthority:authority,customerAlertEligible:false,
        liveReadiness:{historyDisposition:'validated-history',historyReady:true,alertEligible:false}
      },
      {
        id:'fix-demo-saw',dataOrigin:'demo',sku:'HD-FIX-DEMO',storeId:'18360-demo',zip:'18360',channel:'store',
        retailer:'Home Depot',title:'Fixture Demo Saw',price:99,referencePrice:399,
        priceHistory:[399,399,379,399,359,399,399,349,399,399,399,399,329,399],
        comps:{d30:289,d60:275,d90:269,soldCount:22,soldWindowDays:90,activeListingCount:9,currentAsks:[299,289,279]},
        feeRate:.135,shipping:20,taxRate:.06,dataQuality:1,holdingCostPerDay:.1,
        customerAlertEligible:true,alert:{alert:true,priority:'instant'}
      },
      {
        id:'fix-shadow-hidden',dataOrigin:'shadow-live',validationState:'shadow',observedAt:asOf,
        retailer:'Home Depot',title:'Hidden Shadow SKU',sku:'HD-SHADOW',storeId:'1836',zip:'18360',channel:'store',
        price:9,referencePrice:90,source:liveSource('shadow')
      },
      {
        id:'fix-unauthorized',dataOrigin:'live',validationState:'validated',observedAt:'2026-09-07T11:00:00.000Z',
        retailer:'Best Buy',title:'Unauthorized Live TV',sku:'BB-UNAUTH',storeId:'online',zip:'',channel:'online',
        price:199,referencePrice:799,source:liveSource('unauth'),customerAlertEligible:true
      }
    ]
  };
}

return{asOf,feed};
});
