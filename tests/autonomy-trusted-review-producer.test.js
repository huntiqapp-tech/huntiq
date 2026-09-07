'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function gitBlobSha(file) {
  const body = fs.readFileSync(file);
  return crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${body.length}\0`), body])).digest('hex');
}

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'agent-review.yml');
const reviewerPath = path.join(__dirname, '..', 'scripts', 'claude-pr-review.py');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const reviewer = fs.readFileSync(reviewerPath, 'utf8');

assert.equal(gitBlobSha(workflowPath), '99594e96d23d163b3cf75e54b5b8e7be4ec9cf16', 'trusted review workflow must remain at the PM-reviewed blob');
assert.equal(gitBlobSha(reviewerPath), 'e5b93d7d00f5c7649326118d6ceab4feb3c89678', 'trusted Claude reviewer must remain at the PM-reviewed blob');

for (const token of [
  'workflows: ["HUNTIQ tests"]',
  'types: [completed]',
  'head_sha=',
  'workflow_run=',
  'pr_number=',
  'max_automated_fix_attempts=2',
  'auto_merge=false',
  'huntiq-review-packet-${head_sha}',
  'persist-credentials: false',
  'id-token: write',
  'huntiq-review-result-${{ needs.prepare.outputs.head_sha }}',
  'verdict.txt',
  'findings.json'
]) assert(workflow.includes(token), `trusted review workflow contract missing: ${token}`);

for (const token of [
  'submit_review',
  '"enum": ["PASS", "BLOCK"]',
  '"required": ["verdict", "summary", "findings"]',
  'contract violation',
  'verdict.txt',
  'findings.json',
  'redact'
]) assert(reviewer.includes(token), `trusted reviewer contract missing: ${token}`);

assert(!/\bgh\s+pr\s+merge\b/.test(workflow), 'trusted review handoff must never merge');
assert(!/\bgh\s+pr\s+merge\b/.test(reviewer), 'trusted reviewer must never merge');
assert(!/ANTHROPIC_API_KEY\s*:/.test(workflow), 'trusted review handoff must not consume a static Anthropic API key');

console.log('trusted review producer pin tests passed');
