'use strict';

const assert = require('assert');
const { countAttempts } = require('../scripts/autofix-attempt-ledger');

const bot = { login: 'github-actions[bot]' };
const sha0 = '0'.repeat(40);
const sha1 = '1'.repeat(40);
const sha2 = '2'.repeat(40);
const sha3 = '3'.repeat(40);

function comment(attempt, repairSha) {
  return { user: bot, body: `<!-- huntiq-autofix-attempt:${attempt}:${repairSha} -->\nAutonomous repair attempt ${attempt}/2.` };
}

function commit(attempt, repairSha, reviewedSha) {
  return {
    sha: repairSha,
    parents: [{ sha: reviewedSha }],
    commit: {
      message: `fix: bounded autonomous review repair ${attempt}/2\n\nHUNTIQ-Autofix-Attempt: ${attempt}\nHUNTIQ-Reviewed-SHA: ${reviewedSha}`
    }
  };
}

assert.strictEqual(countAttempts([], []), 0, 'empty history has zero attempts');
assert.strictEqual(countAttempts([comment(1, sha1)], [commit(1, sha1, sha0)]), 1, 'one bound attempt is accepted');
assert.strictEqual(
  countAttempts([comment(1, sha1), comment(2, sha2)], [commit(1, sha1, sha0), commit(2, sha2, sha1)]),
  2,
  'two chained attempts exhaust the bounded repair budget'
);

assert.throws(
  () => countAttempts([], [commit(1, sha1, sha0)]),
  /disagree/,
  'deleting the server-side attempt comment must fail closed rather than resetting the budget'
);
assert.throws(
  () => countAttempts([{ user: bot, body: `<!-- huntiq-autofix-attempt:1:${sha1} --> edited` }], [commit(1, sha1, sha0)]),
  /malformed or edited/,
  'edited attempt comments must fail closed'
);
assert.throws(
  () => countAttempts([comment(1, sha1)], [commit(1, sha2, sha0)]),
  /disagree/,
  'fabricated comment/commit SHA pairs must fail closed'
);
const wrongParentCommit = commit(1, sha1, sha0);
wrongParentCommit.parents = [{ sha: sha3 }];
assert.throws(
  () => countAttempts([comment(1, sha1)], [wrongParentCommit]),
  /reviewed parent/,
  'repair commits must be direct children of the reviewed SHA recorded in the commit marker'
);
assert.throws(
  () => countAttempts([comment(1, sha1), comment(1, sha1)], [commit(1, sha1, sha0)]),
  /duplicate autonomous attempt comment/,
  'duplicate attempt markers are ambiguous and must fail closed'
);
assert.throws(
  () => countAttempts([comment(1, sha1)], [commit(1, sha1, sha0), commit(1, sha2, sha0)]),
  /duplicate autonomous attempt commit/,
  'duplicate attempt commits must fail closed'
);
assert.throws(
  () => countAttempts([comment(2, sha2)], [commit(2, sha2, sha1)]),
  /non-contiguous/,
  'an attempt-2 record cannot appear without attempt 1'
);
assert.throws(
  () => countAttempts([{ user: bot, body: `<!-- huntiq-autofix-attempt:3:${sha3} -->` }], []),
  /malformed or edited/,
  'a fabricated third attempt marker must fail closed'
);
assert.throws(
  () => countAttempts([], [{ sha: sha3, parents: [{ sha: sha2 }], commit: { message: `fix: bounded autonomous review repair 3/2\n\nHUNTIQ-Autofix-Attempt: 3\nHUNTIQ-Reviewed-SHA: ${sha2}` } }]),
  /malformed autonomous attempt commit/,
  'a fabricated third repair commit must fail closed'
);
assert.throws(
  () => countAttempts(Array.from({ length: 100 }, () => ({ user: { login: 'someone' }, body: '' })), []),
  /ambiguous paginated/,
  'unbounded comment pagination must not be interpreted as zero attempts'
);
assert.throws(
  () => countAttempts([], Array.from({ length: 100 }, () => ({ sha: sha0, parents: [], commit: { message: 'ordinary' } }))),
  /ambiguous paginated/,
  'unbounded commit pagination must fail closed'
);

console.log('autofix attempt ledger tests passed');
