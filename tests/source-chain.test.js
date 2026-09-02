'use strict';
const assert=require('assert');
const {evaluateOpportunity}=require('../lib/opportunity-evaluator');
const asOf='2026-09-02T05:00:00.000Z';
const sold=(price,days)=>({status:'sold',price,shipping:0,soldAt:new Date(new Date(asOf).getTime()-days*86400000).toISOString(),matchScore:96,sourceConfidence:96});
const comparables=[sold(120,2),sold(118,5),sold(125,9),sold(122,14),sold(119,20),sold(124,28),sold(117,45),sold(116,60)];
const base={opportunity:{price:40,taxRate:.06,shipping:8,returnRate:.05,returnShipping:8,returnHandlingCost:2,nonRefundableFeeRate:.03},comparables,channels:[{name:'eBay',feeRate:.135,fixedFee:.4,holdingDays:21}],history:{sampleCount:14,spanDays:45,confidence:92,historyCoverageScore:94},anomaly:{confidence:91,phase:'new-drop'},deal:{fresh:true,verified:true},asOf};
const strongRetail=[{evidenceQuality:.98,verified:true,direct:true,sourceType:'official-api',retentionPolicy:'persistent',redistributionAllowed:true,ageHours:1,identityMatched:true}];
const strongResale=[{evidenceQuality:.97,verified:true,direct:true,sourceType:'authorized-feed',retentionPolicy:'persistent',redistributionAllowed:true,ageHours:2,identityMatched:true}];
const weakRetail=[{evidenceQuality:.35,verified:false,direct:false,retentionPolicy:'ephemeral',redistributionAllowed:false,ageHours:36,identityMatched:false,conflicted:true}];
const weakResale=[{evidenceQuality:.38,verified:false,direct:false,retentionPolicy:'ephemeral',redistributionAllowed:false,ageHours:72,identityMatched:false,conflicted:true}];
{
 const out=evaluateOpportunity({...base,sourceEvidence:{retailer:strongRetail,resale:strongResale}});
 assert(out.sourceReliability.retailer.score>=85);assert(out.sourceReliability.resale.score>=85);assert(out.evidence.alertEligible);assert(out.evidence.components.combinedSourceScore>=85);
}
{
 const out=evaluateOpportunity({...base,sourceEvidence:{retailer:weakRetail,resale:strongResale}});
 assert(out.sourceReliability.retailer.score<45);assert(out.sourceReliability.resale.score>=85);assert(out.evidence.blockers.includes('weak-retailer-source-reliability'));assert.equal(out.evidence.alertEligible,false);
}
{
 const out=evaluateOpportunity({...base,sourceEvidence:{retailer:strongRetail,resale:weakResale}});
 assert(out.sourceReliability.retailer.score>=85);assert(out.sourceReliability.resale.score<45);assert(out.resale.resaleConfidence<70,'weak resale provenance must cap sold-comp confidence');assert(out.evidence.blockers.includes('weak-resale-source-reliability'));assert.equal(out.evidence.alertEligible,false);
}
console.log('source-chain tests passed');