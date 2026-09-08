(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HUNTIQ_PWA_MANIFEST=api;
})(typeof globalThis!=='undefined'?globalThis:typeof self!=='undefined'?self:this,function(){
'use strict';
const version='0.9.111';
const cache='huntiq-public-v111';
const required=[
  './','./index.html','./calculator.html','./calculator.js','./styles.css','./deal-coach.css','./app.js','./manifest.webmanifest','./icon.svg',
  './lib/enp-calculator.js',
  './lib/pwa-cache-manifest.js','./lib/quality.js','./lib/confirmation.js','./lib/engine.js',
  './lib/marketplace-cost-floor.js','./lib/marketplace-engine-bridge.js','./lib/risk.js','./lib/decision.js',
  './lib/history.js','./lib/history-query.js','./lib/baseline.js','./lib/history-anomaly.js','./lib/freshness.js',
  './lib/fulfillment.js','./lib/stress.js','./lib/basket-promotions.js','./lib/multibuy-promotions.js',
  './lib/acquisition-cost.js','./lib/channel-economics.js','./lib/resale-history.js','./lib/source-reliability.js',
  './lib/evidence-gate.js','./lib/capital-velocity.js','./lib/unit-exposure.js','./lib/partial-liquidation.js',
  './lib/resale-decay.js','./lib/marketplace-late-sale.js','./lib/marketplace-uncertainty.js',
  './lib/opportunity-evaluator.js','./lib/pwa-opportunity.js','./lib/resale-outcome.js','./lib/matching.js',
  './lib/comp-quality.js','./lib/price-consensus.js','./lib/snapshot-store.js','./lib/alerts.js',
  './lib/pwa-marketplace-economics.js','./lib/marketplace-alert-bridge.js','./lib/consensus-alerts.js',
  './lib/alert-stress.js','./lib/alert-outcome.js','./lib/markdown.js','./lib/adapters.js','./lib/pilot.js',
  './lib/pwa-data-state.js','./lib/customer-app-boundary.js','./lib/safe-storage.js','./lib/demo-opportunities.js',
  './lib/customer-feed-fixture.js','./lib/deal-coach.js','./lib/opportunity-ranking.js','./lib/deal-coach-runtime.js',
  './lib/pwa-runtime.js','./lib/opportunity-range.js','./lib/execution-confidence.js','./lib/opportunity-half-life.js',
  './lib/opportunity-confidence.js'
];
const optional=[
  './health.json','./lib/quantity-economics.js','./lib/quantity-alerts.js','./lib/evidence-sufficiency.js',
  './lib/evidence-concentration.js','./lib/evidence-adjustments.js','./lib/opportunity-momentum.js',
  './lib/opportunity-momentum-alert.js','./lib/clearance-lifecycle.js','./lib/inventory-scarcity.js',
  './lib/inventory-scarcity-alert.js','./lib/market-spread-risk.js','./lib/anomaly-lifecycle.js',
  './lib/opportunity-health.js','./lib/customer-presentation.js','./lib/customer-feed.js','./lib/deal-priority.js',
  './lib/resale-condition-risk.js','./lib/resale-dispersion-risk.js','./lib/resale-supply-pressure.js',
  './lib/resale-exit-route.js','./lib/decision-envelope.js','./lib/buy-quantity-optimizer.js',
  './lib/alert-material-change.js','./lib/break-even-resilience.js','./lib/retailer-crosscheck.js',
  './lib/live-opportunity-readiness.js','./lib/observation-integrity.js','./lib/customer-evidence-authority.js',
  './lib/customer-live-authority.js'
];
return{version,cache,required,optional,assets:[...required,...optional]};
});
