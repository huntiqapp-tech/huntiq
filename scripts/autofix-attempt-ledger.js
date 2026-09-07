'use strict';

const fs = require('fs');

const COMMENT_RE = /^<!-- huntiq-autofix-attempt:([12]):([0-9a-f]{40}) -->\n/;
const COMMIT_RE = /^fix: bounded autonomous review repair ([12])\/2\n\nHUNTIQ-Autofix-Attempt: ([12])\nHUNTIQ-Reviewed-SHA: ([0-9a-f]{40})$/;

function countAttempts(comments, commits) {
  if (!Array.isArray(comments) || !Array.isArray(commits)) {
    throw new Error('attempt history must be arrays');
  }
  if (comments.length >= 100 || commits.length >= 100) {
    throw new Error('ambiguous paginated attempt history');
  }

  const commentMap = new Map();
  for (const comment of comments) {
    if (comment?.user?.login !== 'github-actions[bot]') continue;
    const body = comment?.body || '';
    if (!body.includes('huntiq-autofix-attempt:')) continue;
    const match = body.match(COMMENT_RE);
    if (!match) throw new Error('malformed or edited autonomous attempt comment');
    const attempt = Number(match[1]);
    const repairSha = match[2];
    if (commentMap.has(attempt)) throw new Error('duplicate autonomous attempt comment');
    commentMap.set(attempt, repairSha);
  }

  const commitMap = new Map();
  for (const commit of commits) {
    const message = commit?.commit?.message || '';
    if (!message.includes('HUNTIQ-Autofix-Attempt:')) continue;
    const match = message.match(COMMIT_RE);
    if (!match || match[1] !== match[2]) throw new Error('malformed autonomous attempt commit');
    const attempt = Number(match[1]);
    const reviewedSha = match[3];
    const parents = Array.isArray(commit?.parents) ? commit.parents : [];
    if (parents.length !== 1 || parents[0]?.sha !== reviewedSha) {
      throw new Error('autonomous attempt commit is not bound to its reviewed parent');
    }
    if (commitMap.has(attempt)) throw new Error('duplicate autonomous attempt commit');
    commitMap.set(attempt, commit.sha);
  }

  if (commentMap.size !== commitMap.size) {
    throw new Error('attempt comments and immutable PR commit history disagree');
  }
  for (const [attempt, sha] of commitMap) {
    if (commentMap.get(attempt) !== sha) {
      throw new Error('attempt comments and immutable PR commit history disagree');
    }
  }

  const keys = [...commitMap.keys()].sort((a, b) => a - b);
  const expected = Array.from({ length: keys.length }, (_, i) => i + 1);
  if (keys.length > 2 || keys.some((value, i) => value !== expected[i])) {
    throw new Error('non-contiguous or over-budget autonomous attempt history');
  }
  return keys.length;
}

if (require.main === module) {
  const [commentsPath, commitsPath] = process.argv.slice(2);
  if (!commentsPath || !commitsPath) {
    console.error('usage: node scripts/autofix-attempt-ledger.js <comments.json> <commits.json>');
    process.exit(2);
  }
  try {
    const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    const commits = JSON.parse(fs.readFileSync(commitsPath, 'utf8'));
    process.stdout.write(String(countAttempts(comments, commits)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

module.exports = { countAttempts };
