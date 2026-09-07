'use strict';

const assert = require('assert');
const { pathToFileURL } = require('url');
const path = require('path');

async function main() {
  const toolsUrl = pathToFileURL(path.join(__dirname, '../workers/huntiq-agent/src/tools.ts')).href;
  const { runCoachDealTool, runEvaluateEnpTool } = await import(toolsUrl);

  const omitted = runEvaluateEnpTool({
    buyPrice: 20,
    sellPrice: 80,
    fbaOrShipOut: 10,
    marketplace: 'amazon-fba'
  });
  assert.equal(omitted.ok, false);
  assert.equal(omitted.askingPriceUsed, false);
  assert(omitted.errors.some((error) => /soldCompsConfirmed|compKind must be sold/i.test(error)));

  const asking = runEvaluateEnpTool({
    buyPrice: 20,
    sellPrice: 80,
    fbaOrShipOut: 10,
    marketplace: 'amazon-fba',
    compKind: 'asking',
    soldCompsConfirmed: true
  });
  assert.equal(asking.ok, false);
  assert.equal(asking.askingPriceUsed, true);

  const sold = runEvaluateEnpTool({
    buyPrice: 20,
    sellPrice: 80,
    fbaOrShipOut: 10,
    marketplace: 'amazon-fba',
    compKind: 'sold',
    soldCompsConfirmed: true
  });
  assert.equal(sold.ok, true);
  assert.equal(sold.verdict, 'BUY');

  const coachFromAsking = runCoachDealTool({
    verdict: 'BUY',
    enpPerUnit: 36.8,
    roi: 173,
    feesAreConfirmed: true,
    soldCompsConfirmed: true,
    compKind: 'asking'
  });
  assert.equal(coachFromAsking.verdict, 'SKIP');
  assert.equal(coachFromAsking.livePriceErrorClaimed, false);

  const coachUnconfirmed = runCoachDealTool({
    verdict: 'BUY',
    enpPerUnit: 36.8,
    roi: 173,
    feesAreConfirmed: true
  });
  assert.equal(coachUnconfirmed.verdict, 'SKIP');

  console.log('huntiq-agent Think tool execute tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
