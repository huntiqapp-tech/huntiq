import { coachDeal, type CoachInput } from "./coach.ts";
import { evaluateEnp, type EnpInput } from "./enp.ts";

/** Shared by the Think evaluateEnp tool and the public POST /enp handler. */
export function runEvaluateEnpTool(input: EnpInput) {
  return evaluateEnp(input);
}

/** Shared by the Think coachDeal tool. */
export function runCoachDealTool(input: CoachInput) {
  return coachDeal(input);
}
