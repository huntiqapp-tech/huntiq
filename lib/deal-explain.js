(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HuntIQExplain=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const money=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)):'n/a';
  function decisionLabel(opportunity={}){
    const q=opportunity.quantityEconomics||{};
    const qd=opportunity.quantityDecision||opportunity.notification?.quantityDecision||{};
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
    const label=decisionLabel(opportunity);
    const pieces=[label,`${money(economics.profit??opportunity.profit)} est. profit`];
    const roi=Number(economics.roi??opportunity.roi);
    if(Number.isFinite(roi))pieces.push(`${Math.round(roi)}% ROI`);
    if(Number.isFinite(Number(resale.resaleConfidence)))pieces.push(`${Math.round(Number(resale.resaleConfidence))}% resale confidence`);
    if(Number.isFinite(Number(q.plannedUnits)))pieces.push(`${Number(q.plannedUnits)} unit${Number(q.plannedUnits)===1?'':'s'} planned`);
    return {label,text:pieces.join(' · ')};
  }
  return {decisionLabel,summary};
});
