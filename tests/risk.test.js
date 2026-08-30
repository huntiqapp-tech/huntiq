const assert=require('assert');
const R=require('../lib/risk.js');
const E=require('../lib/engine.js');

const stable=R.priceStability([399,399,389,399,399,395,399,399,399,399]);
const volatile=R.priceStability([199,499,249,449,179,529,299,399,229,489]);
assert(stable.stabilityScore>volatile.stabilityScore);
assert(['Very Stable','Stable'].includes(stable.label));
assert(['Variable','Highly Volatile'].includes(volatile.label));

const raw={confidence:90,label:'Probable Error',dropPct:70};
const stableAdjusted=R.stabilityAdjustedAnomaly(raw,[399,399,389,399,399,395,399,399,399,399]);
const volatileAdjusted=R.stabilityAdjustedAnomaly(raw,[199,499,249,449,179,529,299,399,229,489]);
assert(stableAdjusted.confidence>volatileAdjusted.confidence);
assert(volatileAdjusted.confidence<90);

const liquid=R.liquidationValue({conservativeValue:500,liquidityScore:90,spreadPct:5,momentumScore:55});
const risky=R.liquidationValue({conservativeValue:500,liquidityScore:20,spreadPct:45,momentumScore:20});
assert(liquid.value>risky.value);
assert(liquid.haircutPct<risky.haircutPct);

const stress=R.stressEconomics(E.economics,{price:120,feeRate:.135,shipping:20,taxRate:.06,holdingCostPerDay:.1},{conservativeValue:420,liquidityScore:55,spreadPct:20,momentumScore:45,estimatedDaysToSell:12});
assert(stress.value<420);
assert(stress.economics.profit>0);
assert(stress.economics.roi>0);

console.log('HUNTIQ risk tests passed',{stable:stable.stabilityScore,volatile:volatile.stabilityScore,liquidation:stress.value,stressRoi:stress.economics.roi});