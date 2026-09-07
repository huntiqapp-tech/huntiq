import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultReferralPct, evaluateEnp, evaluateEnpMath, ROI_BASIS, TRUST_LINE } from "./enp.ts";

describe("evaluateEnpMath", () => {
  it("documents acquisition-basis ROI and user-entered comps", () => {
    assert.equal(ROI_BASIS, "acquisition");
    assert.match(TRUST_LINE.toLowerCase(), /user-entered/);
    assert.doesNotMatch(TRUST_LINE, /keepa api|bright data|oxylabs/i);
  });

  it("requires buy, sell, and outbound fee", () => {
    const missing = evaluateEnpMath({});
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert(missing.errors.some((error) => /buy price/i.test(error)));
      assert(missing.errors.some((error) => /sell price/i.test(error)));
      assert(missing.errors.some((error) => /fba fee or shipping out/i.test(error)));
    }
  });

  it("matches the public calculator BUY fixture", () => {
    const buy = evaluateEnpMath({
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
    const maybe = evaluateEnpMath({
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

    const pass = evaluateEnpMath({
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

describe("evaluateEnp evidence gate", () => {
  const sold = {
    marketplace: "amazon-fba",
    buyPrice: 20,
    sellPrice: 80,
    fbaOrShipOut: 10,
    compKind: "sold",
    soldCompsConfirmed: true
  };

  it("fails closed without sold-comp confirmation", () => {
    const blocked = evaluateEnp({
      marketplace: "amazon-fba",
      buyPrice: 20,
      sellPrice: 80,
      fbaOrShipOut: 10
    });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.askingPriceUsed, false);
      assert.equal(blocked.soldCompsConfirmed, false);
      assert(blocked.errors.some((error) => /soldCompsConfirmed/i.test(error)));
    }
  });

  it("rejects asking, active, and cancelled listings", () => {
    for (const compKind of ["asking", "active", "cancelled"]) {
      const blocked = evaluateEnp({ ...sold, compKind });
      assert.equal(blocked.ok, false, compKind);
      if (!blocked.ok) {
        assert.equal(blocked.askingPriceUsed, true, compKind);
        assert(blocked.errors.some((error) => /not sold comps/i.test(error)));
      }
    }
  });

  it("rejects MSRP, rebate, store credit, and promo discounts", () => {
    const blocked = evaluateEnp({ ...sold, msrp: 160, rebate: 10, storeCredit: 5, promoDiscount: 8 });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert(blocked.errors.some((error) => /MSRP/i.test(error)));
      assert(blocked.errors.some((error) => /Rebates/i.test(error)));
      assert(blocked.errors.some((error) => /Store credit/i.test(error)));
      assert(blocked.errors.some((error) => /Promotional/i.test(error)));
    }
  });

  it("returns calculator math only after sold comps are confirmed", () => {
    const allowed = evaluateEnp(sold);
    assert.equal(allowed.ok, true);
    if (!allowed.ok) return;
    assert.equal(allowed.verdict, "BUY");
    assert.equal(allowed.askingPriceUsed, false);
    assert.equal(allowed.compKind, "sold");
  });
});
