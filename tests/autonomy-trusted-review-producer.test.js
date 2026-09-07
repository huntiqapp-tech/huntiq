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
  "MAX_AUTOMATED_FIX_ATTEMPTS: '2'",
  'head_sha=$HEAD_SHA',
  'workflow_run=$RUN_URL',
  'pr_number=${PR_NUMBER:-}',
  'max_automated_fix_attempts=$MAX_AUTOMATED_FIX_ATTEMPTS',
  'auto_merge=false',
  'huntiq-review-packet-${{ github.event.workflow_run.head_sha }}',
  'persist-credentials: false',
  'id-token: write',
  'huntiq-review-result-${{ needs.prepare-review.outputs.head_sha }}',
  'verdict.txt',
  'findings.json',
  'This workflow never merges anything; auto-merge remains disabled.'
]) assert(workflow.includes(token), `trusted review workflow contract missing: ${token}`);

for (const token of [
  '"name": "submit_review"',
  '"enum": ["PASS", "BLOCK"]',
  '"required": ["verdict", "summary", "findings"]',
  'malformed structured response is treated as BLOCK',
  '"verdict": "BLOCK"',
  'scrub_secrets',
  'verdict.txt',
  'findings.json',
  'WorkloadIdentityCredentials'
]) assert(reviewer.includes(token), `trusted reviewer contract missing: ${token}`);

assert(!/\bgh\s+pr\s+merge\b/.test(workflow), 'trusted review handoff must never merge');
assert(!/\bgh\s+pr\s+merge\b/.test(reviewer), 'trusted reviewer must never merge');
assert(!/ANTHROPIC_API_KEY\s*:/.test(workflow), 'trusted review handoff must not consume a static Anthropic API key');

console.log('trusted review producer pin tests passed');
