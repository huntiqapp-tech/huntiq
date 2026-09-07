import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultReferralPct, evaluateEnp, ROI_BASIS, TRUST_LINE } from "./enp.ts";

describe("evaluateEnp", () => {
  it("documents acquisition-basis ROI and user-entered comps", () => {
    assert.equal(ROI_BASIS, "acquisition");
    assert.match(TRUST_LINE.toLowerCase(), /user-entered/);
    assert.doesNotMatch(TRUST_LINE, /keepa api|bright data|oxylabs/i);
  });

  it("requires buy, sell, and outbound fee", () => {
    const missing = evaluateEnp({});
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert(missing.errors.some((error) => /buy price/i.test(error)));
      assert(missing.errors.some((error) => /sell price/i.test(error)));
      assert(missing.errors.some((error) => /fba fee or shipping out/i.test(error)));
    }
  });

  it("matches the public calculator BUY fixture", () => {
    const buy = evaluateEnp({
      title: "M18 demo",
      retailer: "Home Depot",
      marketplace: "amazon-fba",
      buyPrice: 20,
      taxRatePct: 6,
      acquireShip: 0,
      units: 2,
      sellPrice: 80,
      conservativeSell: 50,
      optimisticSell: 90,
      referralPct: 15,
      fbaOrShipOut: 10,
      otherFees: 0,
      targetRoi: 30,
      minProfit: 15
    });
    assert.equal(buy.ok, true);
    if (!buy.ok) return;
    assert.equal(buy.acquisition, 21.2);
    assert.equal(buy.sellFees, 22);
    assert.equal(buy.enpPerUnit, 36.8);
    assert.equal(buy.enpTotal, 73.6);
    assert.equal(buy.roi, 173.58);
    assert.equal(buy.maxBuyPrice, 40.57);
    assert.equal(buy.headroom, 20.57);
    assert.equal(buy.verdict, "BUY");
    assert.equal(buy.heroMetric, "enp");
  });

  it("returns MAYBE and PASS on the calculator edge cases", () => {
    const maybe = evaluateEnp({
      marketplace: "amazon-fba",
      buyPrice: 41.5,
      taxRatePct: 6,
      acquireShip: 0,
      sellPrice: 80,
      fbaOrShipOut: 10,
      targetRoi: 30,
      minProfit: 15
    });
    assert.equal(maybe.ok && maybe.verdict, "MAYBE");

    const pass = evaluateEnp({
      marketplace: "ebay",
      buyPrice: 50,
      taxRatePct: 6,
      acquireShip: 5,
      sellPrice: 100,
      referralPct: 15,
      fbaOrShipOut: 12,
      otherFees: 3,
      targetRoi: 30,
      minProfit: 15
    });
    assert.equal(pass.ok && pass.verdict, "PASS");
    assert.equal(defaultReferralPct("ebay"), 13);
  });
});
