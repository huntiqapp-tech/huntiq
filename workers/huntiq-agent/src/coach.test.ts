import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coachDeal, coachFromEnp } from "./coach.ts";
import { evaluateEnp } from "./enp.ts";

describe("coachDeal", () => {
  it("never claims a live pricing error and stays on user-entered data", () => {
    const coach = coachDeal({ verdict: "BUY", enpPerUnit: 36.8, roi: 173, feesAreConfirmed: false });
    assert.equal(coach.livePriceErrorClaimed, false);
    assert.equal(coach.dataState, "user-entered-stub");
    assert.equal(coach.verdict, "WATCH");
    assert(coach.cautions.some((line) => /user-entered/i.test(line)));
  });

  it("can keep BUY only when fees are confirmed", () => {
    const enp = evaluateEnp({
      marketplace: "amazon-fba",
      buyPrice: 20,
      sellPrice: 80,
      fbaOrShipOut: 10
    });
    assert.equal(enp.ok, true);
    if (!enp.ok) return;
    const coach = coachFromEnp(enp, { feesAreConfirmed: true });
    assert.equal(coach.verdict, "BUY");
    assert.equal(coach.livePriceErrorClaimed, false);
  });

  it("maps PASS to SKIP", () => {
    const coach = coachDeal({ verdict: "PASS", enpPerUnit: -4, roi: 5 });
    assert.equal(coach.verdict, "SKIP");
  });
});
