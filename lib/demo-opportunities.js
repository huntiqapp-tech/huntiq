(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQDemoOpportunities=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const list=()=>[
  {id:'hd-m18',dataOrigin:'demo',sku:'HD-DEMO-M18',storeId:'18360-demo',zip:'18360',channel:'store',retailer:'Home Depot',title:'Milwaukee M18 Fuel Combo Kit',price:129,referencePrice:599,priceHistory:[599,599,579,599,599,599,589,599,599,599,599,599,599,599],comps:{d30:489,d60:475,d90:469,soldCount:38,soldWindowDays:90,activeListingCount:14,currentAsks:[499,489,519]},feeRate:.135,shipping:24,taxRate:.06,dataQuality:1,holdingCostPerDay:.15},
  {id:'bb-tv',dataOrigin:'demo',sku:'BB-DEMO-TV',storeId:'online',zip:'',channel:'online',retailer:'Best Buy',title:'65-inch Mini-LED 4K Smart TV',price:299,referencePrice:999,priceHistory:[999,999,949,999,999,979,999,999,999,999,999,999,999,999],comps:{d30:749,d60:735,d90:719,soldCount:24,soldWindowDays:90,activeListingCount:19,currentAsks:[749,779,725]},feeRate:.135,shipping:65,taxRate:.06,dataQuality:.98,holdingCostPerDay:.25},
  {id:'lowes-tools',dataOrigin:'demo',sku:'LOWES-DEMO-KIT',storeId:'online',zip:'18018',channel:'online',retailer:"Lowe's",title:'Pro 6-Tool Cordless Kit',price:179,referencePrice:649,priceHistory:[649,649,629,649,599,649,649,629,649,649,649,649,629,649],comps:{d30:449,d60:429,d90:419,soldCount:31,soldWindowDays:90,activeListingCount:11,currentAsks:[449,459,429]},feeRate:.135,shipping:28,taxRate:.06,dataQuality:.96,holdingCostPerDay:.12},
  {id:'bb-oled',dataOrigin:'demo',sku:'BB-DEMO-OLED',storeId:'online',zip:'',channel:'online',retailer:'Best Buy',title:'14-inch OLED Creator Laptop',price:649,referencePrice:999,priceHistory:[999,949,999,949,899,999,949,999,999,949,999,999,949,999],comps:{d30:899,d60:875,d90:849,soldCount:17,soldWindowDays:90,activeListingCount:28,currentAsks:[899,925,875]},feeRate:.135,shipping:22,taxRate:.06,dataQuality:.95,holdingCostPerDay:.2}
];
return{list};
});
