(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HuntIQExplain=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const money=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)):'n/a';
  const reasonLabels={
    'price-history-thin':'Needs more local price history',
    'anomaly-confidence-low':'Price anomaly is not confirmed enough',
    'resale-confidence-low':'Resale evidence is weak',
    'risk-adjusted-roi-low':'Risk-adjusted ROI is below target',
    'downside-roi-negative':'Downside case loses money',
    'active-ask-only-comps':'Resale value uses active asks, not verified sales',
    'sold-history-unverified':'Sold-price windows lack sold-count verification'
  };
  function readinessState(opportunity={}){
    const readiness=opportunity.readiness||opportunity.notification?.readiness;
    if(!readiness)return{known:false,ready:null,score:null,reasons:[],message:'Readiness not evaluated'};
    const reasons=(readiness.reasons||[]).map(r=>reasonLabels[r]||r);
    return{known:true,ready:!!readiness.ready,score:Number(readiness.readinessScore)||0,reasons,message:readiness.ready?'Evidence ready':reasons[0]||'More evidence required'};
  }
  function decisionLabel(opportunity={}){
    const q=opportunity.quantityEconomics||{};
    const qd=opportunity.quantityDecision||opportunity.notification?.quantityDecision||{};
    const readiness=readinessState(opportunity);
    if(readiness.known&&!readiness.ready)return 'WAIT';
    if(qd.blocked||q.plannedUnits===0)return 'SKIP';
    const verdict=String(opportunity.purchaseDecision?.verdict||'').toUpperCase();
    if(verdict.includes('BUY'))return verdict.includes('STRONG')?'STRONG BUY':'BUY';
    const roi=Number(opportunity.economics?.roi??opportunity.roi);
    const profit=Number(opportunity.economics?.profit??opportunity.profit);
    if(Number.isFinite(roi)&&Number.isFinite(profit)&&roi>=40&&profit>=50)return 'BUY';
    return 'WATCH';
  }
  function summary(opportunity={}){
    const economics=opportunity.economics||{};
    const resale=opportunity.resale||{};
    const q=opportunity.quantityEconomics||{};
    const readiness=readinessState(opportunity);
    const label=decisionLabel(opportunity);
    const pieces=[label,`${money(economics.profit??opportunity.profit)} est. profit`];
    const roi=Number(economics.roi??opportunity.roi);
    if(Number.isFinite(roi))pieces.push(`${Math.round(roi)}% ROI`);
    if(Number.isFinite(Number(resale.resaleConfidence)))pieces.push(`${Math.round(Number(resale.resaleConfidence))}% resale confidence`);
    if(readiness.known)pieces.push(`${readiness.score}% readiness`);
    if(Number.isFinite(Number(q.plannedUnits)))pieces.push(`${Number(q.plannedUnits)} unit${Number(q.plannedUnits)===1?'':'s'} planned`);
    return {label,text:pieces.join(' · '),readiness};
  }
  return {decisionLabel,summary,readinessState};
});