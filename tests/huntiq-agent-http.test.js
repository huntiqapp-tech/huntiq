'use strict';

const assert = require('assert');
const { pathToFileURL } = require('url');
const path = require('path');

async function main() {
  const httpUrl = pathToFileURL(path.join(__dirname, '../workers/huntiq-agent/src/http.ts')).href;
  const serverPath = path.join(__dirname, '../workers/huntiq-agent/src/server.ts');
  const { handlePublicRequest } = await import(httpUrl);
  const serverSource = require('fs').readFileSync(serverPath, 'utf8');

  assert.match(serverSource, /handlePublicRequest\(request\)/);
  assert.match(serverSource, /execute:\s*async \(input\) => runEvaluateEnpTool\(input\)/);
  assert.match(serverSource, /execute:\s*async \(input\) => runCoachDealTool\(input\)/);
  assert.match(serverSource, /compKind:\s*z\s*\.\s*literal\("sold"\)/);
  assert.match(serverSource, /soldCompsConfirmed:\s*z\s*\.\s*literal\(true\)/);
  assert.doesNotMatch(serverSource, /storeMessages\s*=\s*true/);
  assert.doesNotMatch(serverSource, /storeTools\s*=\s*true/);

  const health = await handlePublicRequest(new Request('http://huntiq.test/health'));
  assert.ok(health);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.turnOwner, 'think');
  assert.equal(healthBody.traces.content, 'metadata-only');

  const malformed = await handlePublicRequest(new Request('http://huntiq.test/enp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: 'not-json'
  }));
  assert.equal(malformed.status, 400);
  const malformedBody = await malformed.json();
  assert.equal(malformedBody.ok, false);

  const missingGate = await handlePublicRequest(new Request('http://huntiq.test/enp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      buyPrice: 20,
      sellPrice: 80,
      fbaOrShipOut: 10,
      marketplace: 'amazon-fba',
      soldCompsConfirmed: 'yes'
    })
  }));
  assert.equal(missingGate.status, 400);
  const missingBody = await missingGate.json();
  assert.equal(missingBody.ok, false);
  assert.equal(missingBody.askingPriceUsed, false);
  assert(missingBody.errors.some((error) => /soldCompsConfirmed|compKind must be sold/i.test(error)));

  const asking = await handlePublicRequest(new Request('http://huntiq.test/enp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      buyPrice: 20,
      sellPrice: 80,
      fbaOrShipOut: 10,
      marketplace: 'amazon-fba',
      compKind: 'asking',
      soldCompsConfirmed: true
    })
  }));
  assert.equal(asking.status, 400);
  const askingBody = await asking.json();
  assert.equal(askingBody.ok, false);
  assert.equal(askingBody.askingPriceUsed, true);
  assert.equal(askingBody.coach, undefined);

  const sold = await handlePublicRequest(new Request('http://huntiq.test/enp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      buyPrice: 20,
      sellPrice: 80,
      fbaOrShipOut: 10,
      marketplace: 'amazon-fba',
      compKind: 'sold',
      soldCompsConfirmed: true,
      feesAreConfirmed: true
    })
  }));
  assert.equal(sold.status, 200);
  const soldBody = await sold.json();
  assert.equal(soldBody.ok, true);
  assert.equal(soldBody.verdict, 'BUY');
  assert.equal(soldBody.askingPriceUsed, false);
  assert.equal(soldBody.coach.verdict, 'BUY');
  assert.equal(soldBody.coach.livePriceErrorClaimed, false);

  const unknown = await handlePublicRequest(new Request('http://huntiq.test/agents/HuntiqAgent'));
  assert.equal(unknown, null);

  console.log('huntiq-agent HTTP /enp integration tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
