'use strict';
const {buildCustomerLivePayload}=require('./customer-live-payload');
const {projectAuthorizedOpportunity}=require('./customer-evidence-authority');

// buildCustomerLivePayload now computes and applies the customer evidence-authority
// projection internally (see lib/customer-live-payload.js), so every opportunity it
// returns already carries evidenceAuthority and has been redacted by
// projectAuthorizedOpportunity. This function is kept as the historical/explicit
// entry point for callers that want to be unambiguous about requesting the
// authority-projected payload; it is a direct delegate, not a separate code path,
// so the projection can never be silently skipped by using one name over the other.
function buildCustomerAuthorizedLivePayload(batch,validation,options={}){
  return buildCustomerLivePayload(batch,validation,options);
}

module.exports={projectAuthorizedOpportunity,buildCustomerAuthorizedLivePayload};
