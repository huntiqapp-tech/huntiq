import { TRUST_LINE, type EnpSuccess } from "./enp.ts";

export type CoachInput = {
  title?: string;
  buyPrice?: number;
  enpPerUnit?: number;
  roi?: number;
  maxBuyPrice?: number;
  headroom?: number;
  verdict?: "BUY" | "MAYBE" | "PASS" | "WATCH" | "SKIP";
  downsideEnp?: number | null;
  compsAreUserEntered?: boolean;
  feesAreConfirmed?: boolean;
};

export type CoachResult = {
  verdict: "BUY" | "WATCH" | "SKIP";
  headline: string;
  summary: string;
  reasons: string[];
  cautions: string[];
  trustLine: string;
  livePriceErrorClaimed: false;
  dataState: "user-entered-stub";
  generatedFrom: "huntiq-agent-stub";
};

const money = (value?: number | null) =>
  value == null || !Number.isFinite(value) ? "n/a" : `$${Math.round(value).toLocaleString("en-US")}`;
const pct = (value?: number | null) =>
  value == null || !Number.isFinite(value) ? "n/a" : `${Math.round(value)}%`;

function normalizeVerdict(raw?: string): "BUY" | "WATCH" | "SKIP" {
  const value = String(raw || "").toUpperCase();
  if (value === "BUY") return "BUY";
  if (value === "PASS" || value === "SKIP") return "SKIP";
  return "WATCH";
}

export function coachDeal(input: CoachInput = {}): CoachResult {
  const reasons: string[] = [];
  const cautions: string[] = [];
  const compsAreUserEntered = input.compsAreUserEntered !== false;
  const feesAreConfirmed = input.feesAreConfirmed === true;

  if (compsAreUserEntered) {
    cautions.push(
      "Sold comps are user-entered. This stub does not fetch Keepa, eBay, Amazon, or retailer prices."
    );
  }
  if (!feesAreConfirmed) {
    cautions.push("Treat fees as unconfirmed until the user provides actual referral, FBA, and shipping costs.");
  }
  if (input.enpPerUnit != null && Number.isFinite(input.enpPerUnit)) {
    if (input.enpPerUnit > 0) {
      reasons.push(`Modeled ENP is about ${money(input.enpPerUnit)} per unit after user-supplied fees.`);
    } else {
      cautions.push("Modeled ENP is not profitable after the user-supplied acquisition and fees.");
    }
  }
  if (input.roi != null && Number.isFinite(input.roi)) {
    if (input.roi >= 30) reasons.push(`Acquisition-basis ROI is about ${pct(input.roi)}.`);
    else cautions.push(`Acquisition-basis ROI is only ${pct(input.roi)}.`);
  }
  if (input.headroom != null && input.maxBuyPrice != null && input.buyPrice != null) {
    if (input.headroom >= 0) {
      reasons.push(
        `Buy price ${money(input.buyPrice)} is under the modeled max buy of ${money(input.maxBuyPrice)}.`
      );
    } else {
      cautions.push(
        `Buy price ${money(input.buyPrice)} is above the modeled max buy of ${money(input.maxBuyPrice)}.`
      );
    }
  }
  if (input.downsideEnp != null && Number.isFinite(input.downsideEnp) && input.downsideEnp <= 0) {
    cautions.push("Conservative sold-comp ENP is at or below zero.");
  }

  let verdict = normalizeVerdict(input.verdict);
  if (!feesAreConfirmed && verdict === "BUY") verdict = "WATCH";
  if (compsAreUserEntered && !feesAreConfirmed && verdict === "BUY") verdict = "WATCH";

  const headline =
    verdict === "BUY"
      ? "Numbers clear the stub ENP floor, but they are still user-entered."
      : verdict === "SKIP"
        ? "The modeled numbers do not clear HUNTIQ’s stub ENP floor."
        : "Interesting, but verify sold comps and fees before buying.";
  const summary = [reasons[0], cautions[0]].filter(Boolean).join(" ");

  return {
    verdict,
    headline,
    summary,
    reasons,
    cautions,
    trustLine: TRUST_LINE,
    livePriceErrorClaimed: false,
    dataState: "user-entered-stub",
    generatedFrom: "huntiq-agent-stub"
  };
}

export function coachFromEnp(result: EnpSuccess, extras: Pick<CoachInput, "feesAreConfirmed"> = {}) {
  return coachDeal({
    title: result.title || undefined,
    buyPrice: result.buyPrice,
    enpPerUnit: result.enpPerUnit,
    roi: result.roi,
    maxBuyPrice: result.maxBuyPrice,
    headroom: result.headroom,
    verdict: result.verdict,
    downsideEnp: result.downsideEnp,
    compsAreUserEntered: true,
    feesAreConfirmed: extras.feesAreConfirmed === true
  });
}
