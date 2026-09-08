'use strict';

const { clampInt, INGESTION_AUTOMATION_BUDGET } = require('./live-ingestion');
const { runIngestion } = require('./ingestion-runner');

const HARD_MAX_CYCLES = 24;
const HARD_MAX_INTERVAL_MS = 60 * 60 * 1000;

function resolveSchedule({ once, intervalMs, maxCycles } = {}) {
  const boundedInterval = clampInt(intervalMs, { min: 0, max: HARD_MAX_INTERVAL_MS, fallback: 0 });
  const oneShot = once !== false && (once === true || !boundedInterval);
  const cycles = oneShot ? 1 : clampInt(maxCycles, { min: 1, max: HARD_MAX_CYCLES, fallback: 1 });
  return {
    once: oneShot,
    intervalMs: oneShot ? 0 : boundedInterval,
    maxCycles: cycles
  };
}

async function runScheduledIngestion(options = {}) {
  const schedule = resolveSchedule(options);
  const runs = [];
  for (let cycle = 1; cycle <= schedule.maxCycles; cycle += 1) {
    const result = await runIngestion({
      ...options,
      budget: options.budget || INGESTION_AUTOMATION_BUDGET
    });
    runs.push({ cycle, ...result });
    if (result.failClosed || result.overlapSkipped) break;
    if (cycle < schedule.maxCycles && schedule.intervalMs > 0) {
      await (options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms))))(schedule.intervalMs);
    }
  }
  return {
    ok: runs.every((run) => run.ok || run.overlapSkipped),
    schedule,
    runCount: runs.length,
    alertsEnabled: false,
    historyPromotionAllowed: false,
    runs
  };
}

module.exports = {
  HARD_MAX_CYCLES,
  HARD_MAX_INTERVAL_MS,
  resolveSchedule,
  runScheduledIngestion
};
