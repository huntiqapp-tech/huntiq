'use strict';
const assert=require('assert');
const {assessLiveOpportunityReadiness}=require('../lib/live-opportunity-readiness');

const strong=assessLiveOpportunityReadiness({
  providerValidation:{authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,redistributionAllowed:true,historyPromoted:true},
  historyEvidence:{sampleCount:12,promotedCount:12,anomalyConfidence:88},
  resaleEvidence:{soldCount:8,resaleConfidence:84},
  economics:{expectedProfit:72,roi:61,downsideProfit:41,downsideRoi:34},
  decision:{alertEligible:true}
});
assert.equal(strong.releaseReady,true);
assert.equal(strong.historyDisposition,'validated-history');
assert.equal(strong.anomalyConfidence,88);
assert.equal(strong.conservativeProfit,41);
assert.equal(strong.conservativeRoi,34);
assert.equal(strong.alertEligible,true);
assert.ok(['instant','standard'].includes(strong.alertAction));

const shadow=assessLiveOpportunityReadiness({
  providerValidation:{authenticatedLookupPassed:false,manualSourceCheckPassed:false,customerDisplayAllowed:false,redistributionAllowed:false,historyPromoted:false},
  historyEvidence:{sampleCount:20,promotedCount:0,anomalyConfidence:99},
  resaleEvidence:{soldCount:20,resaleConfidence:95},
  economics:{expectedProfit:200,roi:300,downsideProfit:150,downsideRoi:200},
  decision:{alertEligible:true}
});
assert.equal(shadow.historyDisposition,'shadow-quarantine');
assert.equal(shadow.anomalyConfidence,0,'shadow prices must not establish anomaly authority');
assert.equal(shadow.conservativeProfit,0,'unvalidated provider evidence must not create customer economics');
assert.equal(shadow.alertAction,'suppressed');
assert.ok(shadow.blockers.includes('provider-auth-validation-required'));

const weakResale=assessLiveOpportunityReadiness({
  providerValidation:{authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,redistributionAllowed:true,historyPromoted:true},
  historyEvidence:{sampleCount:10,promotedCount:10,anomalyConfidence:90},
  resaleEvidence:{soldCount:1,resaleConfidence:92},
  economics:{expectedProfit:90,roi:80,downsideProfit:55,downsideRoi:45},
  decision:{alertEligible:true}
});
assert.equal(weakResale.resaleReady,false);
assert.equal(weakResale.conservativeProfit,0);
assert.equal(weakResale.alertAction,'suppressed');

const downsideLoss=assessLiveOpportunityReadiness({
  providerValidation:{authenticatedLookupPassed:true,manualSourceCheckPassed:true,customerDisplayAllowed:true,redistributionAllowed:true,historyPromoted:true},
  historyEvidence:{sampleCount:10,promotedCount:10,anomalyConfidence:90},
  resaleEvidence:{soldCount:7,resaleConfidence:80},
  economics:{expectedProfit:90,roi:80,downsideProfit:-5,downsideRoi:-4},
  decision:{alertEligible:true}
});
assert.equal(downsideLoss.economicsReady,false);
assert.equal(downsideLoss.alertAction,'suppressed');
assert.ok(downsideLoss.blockers.includes('downside-economics-not-positive'));

console.log('live opportunity readiness tests passed');
