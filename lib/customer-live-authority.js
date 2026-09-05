'use strict';
const {buildCustomerLivePayload}=require('./customer-live-payload');
const {summarizeCustomerEvidenceAuthority}=require('./customer-evidence-authority');

function buildCustomerAuthorizedLivePayload(batch,validation,options={}){
  const payload=buildCustomerLivePayload(batch,validation,options);
  const alertsEnabled=options.enableAlerts===true;
  const opportunities=payload.opportunities.map(item=>({
    ...item,
    evidenceAuthority:summarizeCustomerEvidenceAuthority({
      readiness:item.liveReadiness,
      priceHistoryObservations:item.priceHistoryObservations,
      completedSales:item.completedSales,
      comps:item.comps,
      referencePrice:item.referencePrice,
      dataState:item.dataState,
      alertsEnabled
    })
  }));
  return{...payload,opportunities,alertsEnabled:alertsEnabled&&opportunities.some(item=>item.evidenceAuthority.notificationAuthoritative===true&&item.customerAlertEligible===true)};
}

module.exports={buildCustomerAuthorizedLivePayload};
