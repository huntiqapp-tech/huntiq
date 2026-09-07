'use strict';

const assert = require('assert');
const fs = require('fs');
const { execFileSync } = require('child_process');

const expected = {
  '.github/workflows/agent-review.yml': '99594e96d23d163b3cf75e54b5b8e7be4ec9cf16',
  'scripts/claude-pr-review.py': 'e5b93d7d00f5c7649326118d6ceab4feb3c89678',
  '.github/workflows/test.yml': 'c53d191ea87bb0464a1a8aa840a1b90a94981597',
};

function mainBlob(path) {
  return execFileSync('git', ['rev-parse', `origin/main:${path}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

for (const [path, sha] of Object.entries(expected)) {
  assert.strictEqual(
    mainBlob(path),
    sha,
    `trusted main blob changed for ${path}; PM must re-audit and re-pin autonomy before merge`,
  );
}

const repairWorkflow = fs.readFileSync('.github/workflows/autonomous-review-fix.yml', 'utf8');
for (const sha of Object.values(expected)) {
  assert(
    repairWorkflow.includes(sha),
    `autonomous review-fix workflow does not pin trusted main blob ${sha}`,
  );
}

console.log('autonomy trust pins match independently fetched origin/main blobs');
