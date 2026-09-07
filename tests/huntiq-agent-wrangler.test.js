'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'workers', 'huntiq-agent');
const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
const server = fs.readFileSync(path.join(root, 'src', 'server.ts'), 'utf8');

assert.match(wrangler, /"name":\s*"huntiq-agent"/);
assert.match(wrangler, /"enabled":\s*true/);
assert.match(wrangler, /"head_sampling_rate":\s*1/);
assert.doesNotMatch(wrangler, /gethuntiq\.com/);
assert.doesNotMatch(wrangler, /storeMessages|storeTools/);
assert.doesNotMatch(wrangler, /api[_-]?key|secret|token|password/i);
assert.doesNotMatch(server, /storeMessages\s*=\s*true/);
assert.doesNotMatch(server, /storeTools\s*=\s*true/);
assert.match(server, /export class HuntiqAgent extends Think/);
assert.match(server, /soldCompsConfirmed/);
assert.match(server, /compKind/);

console.log('huntiq-agent wrangler/source contract tests passed');
