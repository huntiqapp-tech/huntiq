'use strict';
const {buildCustomerLivePayload}=require('./customer-live-payload');
const {summarizeCustomerEvidenceAuthority}=require('./customer-evidence-authority');

function projectAuthorizedOpportunity(item,evidenceAuthority){
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

function buildCustomerAuthorizedLivePayload(batch,validation,options={}){
  const payload=buildCustomerLivePayload(batch,validation,options);
  const alertsEnabled=options.enableAlerts===true;
  const opportunities=payload.opportunities.map(item=>{
    const evidenceAuthority=summarizeCustomerEvidenceAuthority({
      readiness:item.liveReadiness,
      priceHistoryObservations:item.priceHistoryObservations,
      completedSales:item.completedSales,
      comps:item.comps,
      referencePrice:item.referencePrice,
      dataState:item.dataState,
      alertsEnabled
    });
    return projectAuthorizedOpportunity(item,evidenceAuthority);
  });
  return{...payload,opportunities,alertsEnabled:alertsEnabled&&opportunities.some(item=>item.evidenceAuthority.notificationAuthoritative===true&&item.customerAlertEligible===true)};
}

module.exports={projectAuthorizedOpportunity,buildCustomerAuthorizedLivePayload};
