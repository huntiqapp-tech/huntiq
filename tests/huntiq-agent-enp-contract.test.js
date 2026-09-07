'use strict';

const assert = require('assert');
const { pathToFileURL } = require('url');
const path = require('path');
const Enp = require('../lib/enp-calculator');

const COMPARE_KEYS = [
  'ok',
  'acquisition',
  'sellFees',
  'enpPerUnit',
  'enpTotal',
  'roi',
  'roiBasis',
  'maxBuyPrice',
  'headroom',
  'breakEvenSell',
  'verdict',
  'heroMetric'
];

const fixtures = [
  {
    title: 'M18 demo',
    retailer: 'Home Depot',
    marketplace: 'amazon-fba',
    buyPrice: 20,
    taxRatePct: 6,
    acquireShip: 0,
    units: 2,
    sellPrice: 80,
    conservativeSell: 50,
    optimisticSell: 90,
    referralPct: 15,
    fbaOrShipOut: 10,
    otherFees: 0,
    targetRoi: 30,
    minProfit: 15
  },
  {
    marketplace: 'amazon-fba',
    buyPrice: 41.5,
    taxRatePct: 6,
    acquireShip: 0,
    sellPrice: 80,
    fbaOrShipOut: 10,
    targetRoi: 30,
    minProfit: 15
  },
  {
    marketplace: 'ebay',
    buyPrice: 50,
    taxRatePct: 6,
    acquireShip: 5,
    sellPrice: 100,
    referralPct: 15,
    fbaOrShipOut: 12,
    otherFees: 3,
    targetRoi: 30,
    minProfit: 15
  }
];

function pick(result) {
  const out = {};
  for (const key of COMPARE_KEYS) out[key] = result[key];
  return out;
}

async function main() {
  const workerUrl = pathToFileURL(path.join(__dirname, '../workers/huntiq-agent/src/enp.ts')).href;
  const worker = await import(workerUrl);

  assert.strictEqual(worker.ROI_BASIS, Enp.ROI_BASIS);
  assert.strictEqual(worker.TRUST_LINE, Enp.TRUST_LINE);

  for (const input of fixtures) {
    const calculator = Enp.evaluate(input);
    const agent = worker.evaluateEnpMath(input);
    assert.deepStrictEqual(
      pick(agent),
      pick(calculator),
      `worker ENP math drifted from lib/enp-calculator.js for ${JSON.stringify(input)}`
    );
  }

  const asking = worker.evaluateEnp({
    marketplace: 'amazon-fba',
    buyPrice: 20,
    sellPrice: 80,
    fbaOrShipOut: 10,
    compKind: 'asking',
    soldCompsConfirmed: true
  });
  assert.strictEqual(asking.ok, false);
  assert.strictEqual(asking.askingPriceUsed, true);

  console.log('huntiq-agent ENP contract tests passed', {
    fixtures: fixtures.length,
    verdicts: fixtures.map((input) => Enp.evaluate(input).verdict)
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
