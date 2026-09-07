# huntiq-agent review source snapshot

Automated review packets truncate around 200k characters. `package-lock.json`
sorts before `src/` and fills that budget, so this file exists *above* the
lockfile and repeats the customer-facing Worker source.

`tests/huntiq-agent-wrangler.test.js` asserts each fenced block matches the
live file exactly. Edit the source files, then regenerate this snapshot.

Do not deploy. Do not attach gethuntiq.com here. Traces are metadata-only.

## wrangler.jsonc

```
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "huntiq-agent",
  "main": "src/server.ts",
  "compatibility_date": "2026-09-07",
  "compatibility_flags": ["nodejs_compat"],
  "ai": {
    "binding": "AI"
  },
  "durable_objects": {
    "bindings": [
      {
        "class_name": "HuntiqAgent",
        "name": "HuntiqAgent"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["HuntiqAgent"]
    }
  ],
  "observability": {
    "traces": {
      "enabled": true,
      "head_sampling_rate": 1
    }
  }
}
```

## src/http.ts

```
import { coachFromEnp } from "./coach.ts";
import { evaluateEnp, TRUST_LINE, type EnpInput } from "./enp.ts";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store"
    }
  });
}

function landingPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HUNTIQ agent stub</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; background: #07110f; color: #e8f3ee; }
      main { max-width: 40rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
      h1 { font-size: 1.6rem; }
      code, pre { background: #10221c; padding: 0.15rem 0.35rem; border-radius: 4px; }
      pre { padding: 0.85rem; overflow: auto; }
      a { color: #8ee0b8; }
      .note { color: #b7cfc3; }
    </style>
  </head>
  <body>
    <main>
      <p>HUNTIQ · Cloudflare Workers Think stub</p>
      <h1>ENP / Deal Coach agent</h1>
      <p>This Worker is a future <strong>gethuntiq.com</strong> agent entry. It does not replace the public GitHub Pages PWA or <code>calculator.html</code>.</p>
      <p class="note">No scrape keys. No live retailer feed. Sold comps and fees must be supplied by the user. Tracing is metadata-only.</p>
      <p>Local chat uses the Think / Agents WebSocket protocol at the <code>HuntiqAgent</code> Durable Object. Health and ENP JSON helpers:</p>
      <ul>
        <li><a href="/health">GET /health</a></li>
        <li>POST /enp with sold comps confirmed (asking prices fail closed)</li>
      </ul>
      <pre>curl -s http://127.0.0.1:8787/enp \\
  -H 'content-type: application/json' \\
  -d '{"buyPrice":20,"sellPrice":80,"fbaOrShipOut":10,"marketplace":"amazon-fba","compKind":"sold","soldCompsConfirmed":true}'</pre>
    </main>
  </body>
</html>`;
}

export async function handlePublicRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    return new Response(landingPage(), {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return json({
      ok: true,
      worker: "huntiq-agent",
      agent: "HuntiqAgent",
      turnOwner: "think",
      dataState: "user-entered-stub",
      traces: {
        enabled: true,
        headSamplingRate: 1,
        content: "metadata-only"
      },
      trustLine: TRUST_LINE
    });
  }

  if (request.method === "POST" && url.pathname === "/enp") {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, errors: ["Request body must be JSON."] }, 400);
    }
    const enp = evaluateEnp((body ?? {}) as EnpInput);
    if (!enp.ok) return json(enp, 400);
    return json({
      ...enp,
      coach: coachFromEnp(enp, {
        feesAreConfirmed: Boolean((body as { feesAreConfirmed?: boolean }).feesAreConfirmed)
      })
    });
  }

  return null;
}
```

## src/enp.ts

```
export const TRUST_LINE =
  "Comps are user-entered, not live Keepa or Home Depot data.";
export const ROI_BASIS = "acquisition";
const MAYBE_TOLERANCE = 0.1;

export const RETAILERS = ["Home Depot", "Lowe's", "Walmart", "Best Buy", "Other"] as const;
export const MARKETPLACES = [
  { id: "amazon-fba", label: "Amazon FBA", referralPct: 15, outboundLabel: "FBA fee" },
  { id: "amazon-fbm", label: "Amazon FBM", referralPct: 15, outboundLabel: "Shipping out" },
  { id: "ebay", label: "eBay", referralPct: 13, outboundLabel: "Shipping out" }
] as const;

export type MarketplaceId = (typeof MARKETPLACES)[number]["id"];
export type Retailer = (typeof RETAILERS)[number];
export type CompKind = "sold" | "asking" | "active" | "cancelled" | "unknown";

export type EnpInput = {
  title?: string;
  retailer?: string;
  marketplace?: string;
  buyPrice?: number | string;
  sellPrice?: number | string;
  fbaOrShipOut?: number | string;
  taxRatePct?: number | string;
  acquireShip?: number | string;
  units?: number | string;
  referralPct?: number | string;
  otherFees?: number | string;
  conservativeSell?: number | string | null;
  optimisticSell?: number | string | null;
  targetRoi?: number | string;
  minProfit?: number | string;
  compKind?: string;
  soldCompsConfirmed?: boolean;
  rebate?: unknown;
  storeCredit?: unknown;
  msrp?: unknown;
  promoDiscount?: unknown;
};

export type EnpFailure = {
  ok: false;
  errors: string[];
  trustLine: string;
  roiBasis: typeof ROI_BASIS;
  askingPriceUsed: boolean;
  soldCompsConfirmed: boolean;
};

export type EnpSuccess = {
  ok: true;
  errors: [];
  title: string | null;
  retailer: Retailer;
  marketplace: MarketplaceId;
  marketplaceLabel: string;
  units: number;
  buyPrice: number;
  taxRatePct: number;
  acquireShip: number;
  acquisition: number;
  acquisitionTotal: number;
  sellPrice: number;
  referralPct: number;
  fbaOrShipOut: number;
  otherFees: number;
  sellFees: number;
  enpPerUnit: number;
  enpTotal: number;
  roi: number;
  roiBasis: typeof ROI_BASIS;
  targetRoi: number;
  minProfit: number;
  maxBuyPrice: number;
  headroom: number;
  breakEvenSell: number | null;
  downsideEnp: number | null;
  downsideRoi: number | null;
  upsideEnp: number | null;
  upsideRoi: number | null;
  verdict: "BUY" | "MAYBE" | "PASS";
  trustLine: string;
  heroMetric: "enp";
  compKind: "sold";
  askingPriceUsed: false;
  soldCompsConfirmed: true;
};

export type EnpResult = EnpFailure | EnpSuccess;

const money = (n: number) => +(Number(n) || 0).toFixed(2);
const pct = (n: number) => +(Number(n) || 0).toFixed(2);

export function marketplaceById(id?: string) {
  return MARKETPLACES.find((item) => item.id === id) || MARKETPLACES[0];
}

export function defaultReferralPct(marketplaceId?: string) {
  return marketplaceById(marketplaceId).referralPct;
}

function num(value: unknown, fallback: number | null = null) {
  if (value === "" || value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function scenario(
  sellPrice: number,
  referralRate: number,
  fbaOrShipOut: number,
  otherFees: number,
  acquisition: number
) {
  const sell = Math.max(0, Number(sellPrice) || 0);
  const sellFees = sell * referralRate + fbaOrShipOut + otherFees;
  const profit = sell - sellFees - acquisition;
  const roi = acquisition > 0 ? (profit / acquisition) * 100 : 0;
  return {
    sellPrice: money(sell),
    sellFees: money(sellFees),
    referralFee: money(sell * referralRate),
    profit: money(profit),
    roi: pct(roi)
  };
}

function maxBuyPrice({
  netProceeds,
  acquireShip,
  taxRate,
  targetRoiRate,
  minProfit
}: {
  netProceeds: number;
  acquireShip: number;
  taxRate: number;
  targetRoiRate: number;
  minProfit: number;
}) {
  const profitCap = (netProceeds - minProfit - acquireShip) / (1 + taxRate);
  const roiCap = (netProceeds / (1 + targetRoiRate) - acquireShip) / (1 + taxRate);
  return money(Math.max(0, Math.min(profitCap, roiCap)));
}

function verdictFor({
  headroom,
  profit,
  roi,
  buyPrice,
  maxBuy,
  minProfit,
  targetRoi
}: {
  headroom: number;
  profit: number;
  roi: number;
  buyPrice: number;
  maxBuy: number;
  minProfit: number;
  targetRoi: number;
}) {
  const hitsProfit = profit + 1e-9 >= minProfit;
  const hitsRoi = roi + 1e-9 >= targetRoi;
  if (headroom + 1e-9 >= 0 && hitsProfit && hitsRoi) return "BUY" as const;
  const closeProfit = profit + 1e-9 >= minProfit * (1 - MAYBE_TOLERANCE);
  const closeRoi = roi + 1e-9 >= targetRoi * (1 - MAYBE_TOLERANCE);
  const closeBuy = maxBuy > 0 ? buyPrice <= maxBuy * (1 + MAYBE_TOLERANCE) : false;
  if (closeProfit && closeRoi && closeBuy && profit > 0) return "MAYBE" as const;
  return "PASS" as const;
}

const NON_SOLD_COMPS = new Set(["asking", "active", "cancelled"]);

export function normalizeCompKind(value?: string): CompKind {
  const kind = String(value || "unknown").trim().toLowerCase();
  if (kind === "sold" || kind === "asking" || kind === "active" || kind === "cancelled") return kind;
  return "unknown";
}

export function evidenceErrors(input: EnpInput = {}): string[] {
  const errors: string[] = [];
  const kind = normalizeCompKind(input.compKind);
  if (NON_SOLD_COMPS.has(kind)) {
    errors.push("Asking, active, or cancelled listings are not sold comps and cannot set ENP.");
  }
  if (kind !== "sold") {
    errors.push("compKind must be sold. ENP fails closed without completed-sale comps.");
  }
  if (input.soldCompsConfirmed !== true) {
    errors.push("soldCompsConfirmed must be true. Unconfirmed comps cannot set ENP.");
  }
  if (input.rebate != null && input.rebate !== "") {
    errors.push("Rebates cannot change acquisition cost or ENP.");
  }
  if (input.storeCredit != null && input.storeCredit !== "") {
    errors.push("Store credit cannot change acquisition cost or ENP.");
  }
  if (input.msrp != null && input.msrp !== "") {
    errors.push("MSRP cannot change acquisition cost, ENP, or ROI.");
  }
  if (input.promoDiscount != null && input.promoDiscount !== "") {
    errors.push("Promotional discounts cannot silently reduce acquisition cost.");
  }
  return errors;
}

/** Calculator-identical math. Does not apply the sold-comp evidence gate. */
export function evaluateEnpMath(input: EnpInput = {}): EnpResult {
  const errors: string[] = [];
  const marketplace = marketplaceById(input.marketplace);
  const buyPrice = num(input.buyPrice);
  const sellPrice = num(input.sellPrice);
  const fbaOrShipOut = num(input.fbaOrShipOut);
  const taxRatePct = num(input.taxRatePct, 6);
  const acquireShip = num(input.acquireShip, 0);
  const units = num(input.units, 1);
  const referralPct = num(input.referralPct, marketplace.referralPct);
  const otherFees = num(input.otherFees, 0);
  const conservativeSell = num(input.conservativeSell, null);
  const optimisticSell = num(input.optimisticSell, null);
  const targetRoi = num(input.targetRoi, 30);
  const minProfit = num(input.minProfit, 15);
  const title = String(input.title || "").trim();
  const retailer = RETAILERS.includes(input.retailer as Retailer)
    ? (input.retailer as Retailer)
    : "Other";

  if (!(buyPrice != null && buyPrice > 0)) errors.push("Buy price is required.");
  if (!(sellPrice != null && sellPrice > 0)) errors.push("Expected sell price is required.");
  if (!Number.isFinite(fbaOrShipOut) || (fbaOrShipOut as number) < 0) {
    errors.push("FBA fee or shipping out is required.");
  }
  if (!Number.isFinite(taxRatePct) || (taxRatePct as number) < 0) {
    errors.push("Tax rate must be zero or greater.");
  }
  if (!Number.isFinite(acquireShip) || (acquireShip as number) < 0) {
    errors.push("Shipping/gas to acquire must be zero or greater.");
  }
  if (!Number.isFinite(units) || (units as number) < 1 || !Number.isInteger(Number(units))) {
    errors.push("Units must be a whole number of 1 or more.");
  }
  if (!Number.isFinite(referralPct) || (referralPct as number) < 0 || (referralPct as number) >= 100) {
    errors.push("Referral fee must be between 0 and 100.");
  }
  if (!Number.isFinite(otherFees) || (otherFees as number) < 0) {
    errors.push("Other fees must be zero or greater.");
  }
  if (conservativeSell != null && !(conservativeSell >= 0)) {
    errors.push("Conservative sell low must be zero or greater.");
  }
  if (optimisticSell != null && !(optimisticSell >= 0)) {
    errors.push("Optimistic sell high must be zero or greater.");
  }
  if (!Number.isFinite(targetRoi) || (targetRoi as number) < 0) {
    errors.push("Target ROI must be zero or greater.");
  }
  if (!Number.isFinite(minProfit)) errors.push("Min profit must be a number.");

  if (errors.length) {
    return {
      ok: false,
      errors,
      trustLine: TRUST_LINE,
      roiBasis: ROI_BASIS,
      askingPriceUsed: NON_SOLD_COMPS.has(normalizeCompKind(input.compKind)),
      soldCompsConfirmed: input.soldCompsConfirmed === true
    };
  }

  const taxRate = (taxRatePct as number) / 100;
  const referralRate = (referralPct as number) / 100;
  const acquisition = (buyPrice as number) * (1 + taxRate) + (acquireShip as number);
  const expected = scenario(
    sellPrice as number,
    referralRate,
    fbaOrShipOut as number,
    otherFees as number,
    acquisition
  );
  const netProceeds =
    (sellPrice as number) * (1 - referralRate) - (fbaOrShipOut as number) - (otherFees as number);
  const maxBuy = maxBuyPrice({
    netProceeds,
    acquireShip: acquireShip as number,
    taxRate,
    targetRoiRate: (targetRoi as number) / 100,
    minProfit: minProfit as number
  });
  const headroom = money(maxBuy - (buyPrice as number));
  const breakEvenSell =
    referralRate < 1
      ? money((acquisition + (fbaOrShipOut as number) + (otherFees as number)) / (1 - referralRate))
      : null;
  const downside =
    conservativeSell != null
      ? scenario(
          conservativeSell,
          referralRate,
          fbaOrShipOut as number,
          otherFees as number,
          acquisition
        )
      : null;
  const upside =
    optimisticSell != null
      ? scenario(
          optimisticSell,
          referralRate,
          fbaOrShipOut as number,
          otherFees as number,
          acquisition
        )
      : null;
  const verdict = verdictFor({
    headroom,
    profit: expected.profit,
    roi: expected.roi,
    buyPrice: buyPrice as number,
    maxBuy,
    minProfit: minProfit as number,
    targetRoi: targetRoi as number
  });

  return {
    ok: true,
    errors: [],
    title: title || null,
    retailer,
    marketplace: marketplace.id,
    marketplaceLabel: marketplace.label,
    units: Number(units),
    buyPrice: money(buyPrice as number),
    taxRatePct: pct(taxRatePct as number),
    acquireShip: money(acquireShip as number),
    acquisition: money(acquisition),
    acquisitionTotal: money(acquisition * Number(units)),
    sellPrice: expected.sellPrice,
    referralPct: pct(referralPct as number),
    fbaOrShipOut: money(fbaOrShipOut as number),
    otherFees: money(otherFees as number),
    sellFees: expected.sellFees,
    enpPerUnit: expected.profit,
    enpTotal: money(expected.profit * Number(units)),
    roi: expected.roi,
    roiBasis: ROI_BASIS,
    targetRoi: pct(targetRoi as number),
    minProfit: money(minProfit as number),
    maxBuyPrice: maxBuy,
    headroom,
    breakEvenSell,
    downsideEnp: downside ? downside.profit : null,
    downsideRoi: downside ? downside.roi : null,
    upsideEnp: upside ? upside.profit : null,
    upsideRoi: upside ? upside.roi : null,
    verdict,
    trustLine: TRUST_LINE,
    heroMetric: "enp",
    compKind: "sold",
    askingPriceUsed: false,
    soldCompsConfirmed: true
  };
}

export function evaluateEnp(input: EnpInput = {}): EnpResult {
  const blocked = evidenceErrors(input);
  if (blocked.length) {
    return {
      ok: false,
      errors: blocked,
      trustLine: TRUST_LINE,
      roiBasis: ROI_BASIS,
      askingPriceUsed: NON_SOLD_COMPS.has(normalizeCompKind(input.compKind)),
      soldCompsConfirmed: input.soldCompsConfirmed === true
    };
  }
  return evaluateEnpMath(input);
}
```

## src/server.ts

```
import { Think } from "@cloudflare/think";
import { routeAgentRequest } from "agents";
import { tool } from "ai";
import { z } from "zod";
import { coachDeal } from "./coach.ts";
import { evaluateEnp, TRUST_LINE } from "./enp.ts";
import { handlePublicRequest } from "./http.ts";

const SYSTEM_PROMPT = [
  "You are HUNTIQ's ENP / Deal Coach stub for future gethuntiq.com use.",
  "HUNTIQ helps users judge retail buys using estimated net profit (ENP), not MSRP percent-off.",
  "You only evaluate numbers the user supplies: buy price, sold comps, and confirmed fees.",
  "Never scrape retailers. Never call Keepa, Bright Data, Oxylabs, RetailerAPI, or any live price API.",
  "Never invent a buy price, sold comp, or fee. Ask the user for missing numbers, then call evaluateEnp.",
  "After evaluateEnp succeeds, call coachDeal (or rely on its returned coaching) before recommending action.",
  "Never claim HUNTIQ found a live pricing error. This stub has no live retailer feed.",
  "Sold comps only. Confirmed fees only. ROI is acquisition-basis.",
  TRUST_LINE
].join(" ");

const marketplaceSchema = z
  .enum(["amazon-fba", "amazon-fbm", "ebay"])
  .optional()
  .describe("Resale channel. Defaults to Amazon FBA.");

const enpInputSchema = z.object({
  title: z.string().optional().describe("Optional item title for the explanation."),
  retailer: z.string().optional().describe("Retailer name such as Home Depot or Walmart."),
  marketplace: marketplaceSchema,
  buyPrice: z.number().positive().describe("Cash buy price before tax."),
  sellPrice: z.number().positive().describe("User-entered expected sold-comp price."),
  fbaOrShipOut: z.number().nonnegative().describe("Confirmed FBA fee or outbound shipping."),
  taxRatePct: z.number().nonnegative().optional().describe("Sales tax percent. Defaults to 6."),
  acquireShip: z.number().nonnegative().optional().describe("Shipping or gas to acquire. Defaults to 0."),
  units: z.number().int().positive().optional().describe("Unit count. Defaults to 1."),
  referralPct: z.number().min(0).lt(100).optional().describe("Marketplace referral percent if confirmed."),
  otherFees: z.number().nonnegative().optional().describe("Other confirmed selling fees."),
  conservativeSell: z.number().nonnegative().optional().describe("Optional low sold-comp."),
  optimisticSell: z.number().nonnegative().optional().describe("Optional high sold-comp."),
  targetRoi: z.number().nonnegative().optional().describe("Target ROI percent. Defaults to 30."),
  minProfit: z.number().optional().describe("Minimum profit dollars. Defaults to 15."),
  compKind: z
    .literal("sold")
    .describe("Must be completed sold comps. Asking, active, or cancelled listings are rejected."),
  soldCompsConfirmed: z
    .literal(true)
    .describe("User confirms these are completed sales, not asking prices.")
});

/**
 * Think owns every agent turn. Payload content is metadata-only:
 * do not set storeMessages or storeTools to true.
 */
export class HuntiqAgent extends Think<Env> {
  getModel() {
    return "@cf/moonshotai/kimi-k2.7-code";
  }

  getSystemPrompt() {
    return SYSTEM_PROMPT;
  }

  getTools() {
    return {
      evaluateEnp: tool({
        description:
          "Calculate HUNTIQ ENP, acquisition-basis ROI, max buy, headroom, and BUY/MAYBE/PASS from user-supplied numbers only.",
        inputSchema: enpInputSchema,
        execute: async (input) => evaluateEnp(input)
      }),
      coachDeal: tool({
        description:
          "Turn an ENP result or user-supplied metrics into a BUY/WATCH/SKIP explanation. Never claims a live price error.",
        inputSchema: z.object({
          title: z.string().optional(),
          buyPrice: z.number().optional(),
          enpPerUnit: z.number().optional(),
          roi: z.number().optional(),
          maxBuyPrice: z.number().optional(),
          headroom: z.number().optional(),
          verdict: z.enum(["BUY", "MAYBE", "PASS", "WATCH", "SKIP"]).optional(),
          downsideEnp: z.number().nullable().optional(),
          compsAreUserEntered: z.boolean().optional(),
          feesAreConfirmed: z.boolean().optional(),
          soldCompsConfirmed: z.boolean().optional(),
          compKind: z.string().optional()
        }),
        execute: async (input) => coachDeal(input)
      })
    };
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const publicResponse = await handlePublicRequest(request);
    if (publicResponse) return publicResponse;
    return (
      (await routeAgentRequest(request, env, { cors: true })) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
```
