'use strict';

const { execFileSync } = require('child_process');

const EXCEPTION_RECORD = 'docs/live-data-safety-gap.md';
const FROZEN_MODEL_PATHS = [
  /^lib\/(?:.*(?:score|scoring|risk|freshness|ranking|inventory|resale|alert|confidence|anomaly|momentum|liquidation|economics).*)\.js$/,
  /^db\/\d+_.*(?:score|risk|freshness|ranking|inventory|resale|alert|confidence|anomaly|momentum|liquidation|economics).*\.sql$/,
  /^tests\/.*(?:score|scoring|risk|freshness|ranking|inventory|resale|alert|confidence|anomaly|momentum|liquidation|economics).*\.test\.js$/
];

function checkChangedFiles(files = []) {
  const normalized = files.map(file => String(file).trim()).filter(Boolean);
  const frozen = normalized.filter(file => FROZEN_MODEL_PATHS.some(pattern => pattern.test(file)));
  if (!frozen.length || normalized.includes(EXCEPTION_RECORD)) return [];
  return frozen;
}

function changedFiles(baseSha) {
  if (!baseSha || /^0+$/.test(baseSha)) return [];
  return execFileSync('git', ['diff', '--name-only', baseSha, 'HEAD'], { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
}

function main() {
  const baseSha = process.env.HUNTIQ_BASE_SHA;
  if (!baseSha) {
    console.log('active-priority guard skipped outside a commit-diff workflow');
    return;
  }
  const files = changedFiles(baseSha);
  const blocked = checkChangedFiles(files);
  if (!blocked.length) {
    console.log('active-priority guard passed');
    return;
  }
  console.error('Active live-data priority violation.');
  console.error('Frozen model files changed without docs/live-data-safety-gap.md:');
  for (const file of blocked) console.error(`- ${file}`);
  console.error('Document the authenticated provider output and unmet safety gap, or move this work back to the provider/customer-delivery queue.');
  process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { EXCEPTION_RECORD, FROZEN_MODEL_PATHS, checkChangedFiles };
