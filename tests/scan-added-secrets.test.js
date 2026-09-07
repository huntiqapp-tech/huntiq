'use strict';

const assert = require('assert');
const { scanText, addedLines } = require('../scripts/scan-added-secrets');

assert.deepStrictEqual(addedLines('+++ b/file\n+hello\n context\n-old'), [{ text: 'hello', lineNumber: 2 }]);

const fixtures = [
  ['private key', '+-----BEGIN PRIVATE KEY-----'],
  ['AWS', '+const key = "AKIAABCDEFGHIJKLMNOP";'],
  ['GitHub', '+const token = "ghp_abcdefghijklmnopqrstuvwxyz123456";'],
  ['generic assignment', '+PASSWORD=super-secret-password-value'],
  ['credential URL', '+DATABASE_URL=postgres://admin:supersecretpassword@example.invalid/db'],
  ['JWT', '+const jwt = "eyJabcdefghijklmno.abcdefghijklmnop.abcdefghijklmnop";'],
  ['SendGrid', '+const key = "SG.abcdefghijklmnop.qrstuvwxyzABCDEFGHIJKLMN";'],
];
for (const [name, diff] of fixtures) {
  assert(scanText(diff).length > 0, `${name} fixture must be rejected`);
}

const safe = [
  '+ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}',
  '+const token = process.env.GITHUB_TOKEN;',
  '+password = $DATABASE_PASSWORD',
  '+const key = "REDACTED";',
  '+const api = vars.API_ENDPOINT;',
].join('\n');
assert.deepStrictEqual(scanText(safe), [], 'environment/secret references and redacted placeholders must not be treated as committed credentials');

assert.deepStrictEqual(scanText('-PASSWORD=actual-secret-not-added'), [], 'removed lines are not additions');
assert.deepStrictEqual(scanText(' context TOKEN=actual-secret-not-added'), [], 'context lines are not additions');

console.log('added-line secret scanner tests passed');
