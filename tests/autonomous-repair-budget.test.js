'use strict';

const assert = require('assert');
const { computeRepairBudget } = require('../scripts/autonomous-repair-budget');

const a = 'a'.repeat(40), b = 'b'.repeat(40), c = 'c'.repeat(40);
assert.deepEqual(computeRepairBudget([a], a), { fix: true, cap: false, attempt: 1, uniqueBlockedShas: 1 });
assert.deepEqual(computeRepairBudget([a, b], b), { fix: true, cap: false, attempt: 2, uniqueBlockedShas: 2 });
assert.deepEqual(computeRepairBudget([a, b, c], c), { fix: false, cap: true, attempt: 2, uniqueBlockedShas: 3 });
assert.deepEqual(computeRepairBudget([a, a, a], a), { fix: true, cap: false, attempt: 1, uniqueBlockedShas: 1 }, 'repeated BLOCK of one exact SHA must not consume another repair attempt');
assert.deepEqual(computeRepairBudget([a, b, a, b], b), { fix: true, cap: false, attempt: 2, uniqueBlockedShas: 2 }, 'duplicate review runs must not exceed the two unique-SHA repair budget');
assert.throws(() => computeRepairBudget([a, b], c), /current trusted BLOCK SHA is absent/, 'current BLOCK must be represented in the trusted ledger');

console.log('autonomous repair budget tests passed');
