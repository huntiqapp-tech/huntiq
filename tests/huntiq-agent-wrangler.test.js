'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'workers', 'huntiq-agent');
const scanFiles = fs.readdirSync(path.join(root, 'src')).map((name) => `src/${name}`);
scanFiles.push('wrangler.jsonc', 'package.json', 'README.md');

const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
const server = fs.readFileSync(path.join(root, 'src', 'server.ts'), 'utf8');

assert.match(wrangler, /"name":\s*"huntiq-agent"/);
assert.match(wrangler, /"enabled":\s*true/);
assert.match(wrangler, /"head_sampling_rate":\s*1/);
assert.doesNotMatch(wrangler, /gethuntiq\.com/);
assert.doesNotMatch(wrangler, /storeMessages|storeTools/);
assert.match(server, /export class HuntiqAgent extends Think/);
assert.match(server, /runEvaluateEnpTool\(input\)/);
assert.match(server, /runCoachDealTool\(input\)/);
assert.match(server, /compKind:\s*z\s*\.\s*literal\("sold"\)/);
assert.match(server, /soldCompsConfirmed:\s*z\s*\.\s*literal\(true\)/);

for (const relative of scanFiles) {
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  assert.doesNotMatch(text, /storeMessages\s*=\s*true/, relative);
  assert.doesNotMatch(text, /storeTools\s*=\s*true/, relative);
  assert.doesNotMatch(
    text,
    /(?:RETAILERAPI_KEY|BRIGHTDATA_API_TOKEN|OPENAI_API_KEY|sk-[A-Za-z0-9]{10,}|api[_-]?key\s*[:=]\s*['"][^'"]+)/i,
    relative
  );
}

console.log('huntiq-agent wrangler/source contract tests passed');
