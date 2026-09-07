'use strict';

function computeRepairBudget(blockedShas = [], currentReviewedSha = null) {
  const normalized = [...new Set((blockedShas || []).map(value => String(value || '').trim()).filter(Boolean))];
  if (!currentReviewedSha || !normalized.includes(String(currentReviewedSha).trim())) {
    throw new Error('current trusted BLOCK SHA is absent from repair ledger');
  }
  if (normalized.length >= 3) return { fix: false, cap: true, attempt: 2, uniqueBlockedShas: normalized.length };
  return { fix: true, cap: false, attempt: normalized.length, uniqueBlockedShas: normalized.length };
}

if (require.main === module) {
  const currentReviewedSha = process.argv[2];
  const input = require('fs').readFileSync(0, 'utf8');
  const blockedShas = input.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  try {
    const result = computeRepairBudget(blockedShas, currentReviewedSha);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { computeRepairBudget };
