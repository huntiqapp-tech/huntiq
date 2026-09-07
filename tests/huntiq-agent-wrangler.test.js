'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'workers', 'huntiq-agent');
const snapshotFiles = [
  'wrangler.jsonc',
  'src/http.ts',
  'src/enp.ts',
  'src/server.ts'
];
const scanFiles = [
  ...snapshotFiles,
  'src/coach.ts',
  'package.json',
  'README.md',
  'AGENT.md'
];

const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
const agentMd = fs.readFileSync(path.join(root, 'AGENT.md'), 'utf8');

assert.match(wrangler, /"name":\s*"huntiq-agent"/);
assert.match(wrangler, /"enabled":\s*true/);
assert.match(wrangler, /"head_sampling_rate":\s*1/);
assert.doesNotMatch(wrangler, /gethuntiq\.com/);
assert.doesNotMatch(wrangler, /storeMessages|storeTools/);

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

for (const relative of snapshotFiles) {
  const body = fs.readFileSync(path.join(root, relative), 'utf8').replace(/\n$/, '');
  const fence = `## ${relative}\n\n\`\`\`\n${body}\n\`\`\``;
  assert.ok(agentMd.includes(fence), `AGENT.md must include an exact snapshot of ${relative}`);
}

console.log('huntiq-agent wrangler/source contract tests passed');
