'use strict';
const assert=require('assert');
const {projectAuthorizedOpportunity}=require('../lib/customer-live-authority');

const base={
  referencePrice:120,
  comps:{d30:150,d60:145,d90:140,soldWindowDays:90,activeListingCount:7,currentAsks:[155,160],authoritative:true},
  liveReadiness:{anomalyConfidence:91,conservativeProfit:42,conservativeRoi:68,alertEligible:true,alertAction:'instant'},
  customerAlertEligible:true
};

const fullAuthority={anomalyAuthoritative:true,marketComparisonAuthoritative:true,profitRoiAuthoritative:true,notificationAuthoritative:true};
const full=projectAuthorizedOpportunity(base,fullAuthority);
assert.equal(full.referencePrice,120);
assert.equal(full.comps.d30,150);
assert.equal(full.customerProfit,42);
assert.equal(full.customerRoi,68);
assert.equal(full.customerAlertEligible,true);
assert.equal(full.liveReadiness.alertAction,'instant');

const noHistory=projectAuthorizedOpportunity(base,{...fullAuthority,anomalyAuthoritative:false,profitRoiAuthoritative:false,notificationAuthoritative:false});
assert.equal(noHistory.referencePrice,null,'unauthorized anomaly reference must not reach the PWA');
assert.equal(noHistory.liveReadiness.anomalyConfidence,0);
assert.equal(noHistory.customerProfit,null);
assert.equal(noHistory.customerRoi,null);
assert.equal(noHistory.liveReadiness.conservativeProfit,0);
assert.equal(noHistory.liveReadiness.conservativeRoi,0);
assert.equal(noHistory.customerAlertEligible,false);
assert.equal(noHistory.liveReadiness.alertEligible,false);
assert.equal(noHistory.liveReadiness.alertAction,'suppressed');

const noMarket=projectAuthorizedOpportunity(base,{...fullAuthority,marketComparisonAuthoritative:false,profitRoiAuthoritative:false,notificationAuthoritative:false});
assert.equal(noMarket.comps.d30,null);
assert.equal(noMarket.comps.d60,null);
assert.equal(noMarket.comps.d90,null);
assert.equal(noMarket.comps.soldWindowDays,null);
assert.equal(noMarket.comps.authoritative,false);
assert.deepEqual(noMarket.comps.currentAsks,[155,160],'non-authoritative asks may remain as context');
assert.equal(noMarket.comps.activeListingCount,7,'listing supply context may remain visible');
assert.equal(noMarket.customerProfit,null);
assert.equal(noMarket.customerRoi,null);
assert.equal(noMarket.customerAlertEligible,false);

console.log('customer live authorized redaction tests passed');
