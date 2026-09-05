(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQCustomerEvidenceAuthority=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const finite=value=>Number.isFinite(Number(value));
const verifiedCount=rows=>Array.isArray(rows)?rows.filter(row=>row&&row.verified===true).length:0;

function summarizeCustomerEvidenceAuthority({readiness={},priceHistoryObservations=[],completedSales=[],comps={},referencePrice=null,dataState=null,alertsEnabled=false}={}){
  const historyVerifiedCount=verifiedCount(priceHistoryObservations);
  const completedSaleVerifiedCount=verifiedCount(completedSales);
  const historyAuthoritative=readiness.historyReady===true&&historyVerifiedCount>=3;
  const anomalyAuthoritative=historyAuthoritative&&finite(referencePrice)&&Number(readiness.anomalyConfidence)>0;
  const marketComparisonAuthoritative=readiness.resaleReady===true&&completedSaleVerifiedCount>=3&&comps.authoritative===true;
  const profitRoiAuthoritative=readiness.releaseReady===true&&readiness.economicsReady===true&&historyAuthoritative&&marketComparisonAuthoritative&&Number(readiness.conservativeProfit)>0&&Number(readiness.conservativeRoi)>0;
  const notificationAuthoritative=alertsEnabled===true&&readiness.alertEligible===true&&profitRoiAuthoritative&&dataState==='live';
  const blockers=new Set(Array.isArray(readiness.blockers)?readiness.blockers:[]);
  if(!historyAuthoritative)blockers.add('customer-history-authority-missing');
  if(!anomalyAuthoritative)blockers.add('customer-anomaly-authority-missing');
  if(!marketComparisonAuthoritative)blockers.add('customer-market-comparison-authority-missing');
  if(!profitRoiAuthoritative)blockers.add('customer-profit-roi-authority-missing');
  if(!notificationAuthoritative)blockers.add('customer-notification-authority-missing');
  return{
    historyVerifiedCount,completedSaleVerifiedCount,
    historyAuthoritative,anomalyAuthoritative,marketComparisonAuthoritative,profitRoiAuthoritative,notificationAuthoritative,
    referencePriceAuthorized:anomalyAuthoritative,
    aggregateMarketValueAuthorized:marketComparisonAuthoritative,
    blockers:[...blockers]
  };
}

function projectAuthorizedOpportunity(item={},evidenceAuthority){
  const authority=evidenceAuthority||{};
  const readiness={...(item.liveReadiness||{})};
  if(authority.anomalyAuthoritative!==true)readiness.anomalyConfidence=0;
  if(authority.profitRoiAuthoritative!==true){
    readiness.conservativeProfit=0;
    readiness.conservativeRoi=0;
  }
  if(authority.notificationAuthoritative!==true){
    readiness.alertEligible=false;
    readiness.alertAction='suppressed';
  }
  const comps={...(item.comps||{})};
  if(authority.marketComparisonAuthoritative!==true){
    comps.d30=null;
    comps.d60=null;
    comps.d90=null;
    comps.soldWindowDays=null;
    comps.authoritative=false;
  }
  return{
    ...item,
    referencePrice:authority.anomalyAuthoritative===true?item.referencePrice:null,
    comps,
    liveReadiness:readiness,
    customerProfit:authority.profitRoiAuthoritative===true?Number(readiness.conservativeProfit):null,
    customerRoi:authority.profitRoiAuthoritative===true?Number(readiness.conservativeRoi):null,
    customerAlertEligible:authority.notificationAuthoritative===true&&item.customerAlertEligible===true,
    evidenceAuthority:authority
  };
}

return{summarizeCustomerEvidenceAuthority,projectAuthorizedOpportunity};
});
