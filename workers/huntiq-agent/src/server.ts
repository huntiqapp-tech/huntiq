import { Think } from "@cloudflare/think";
import { routeAgentRequest } from "agents";
import { tool } from "ai";
import { z } from "zod";
import { TRUST_LINE } from "./enp.ts";
import { handlePublicRequest } from "./http.ts";
import { runCoachDealTool, runEvaluateEnpTool } from "./tools.ts";

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
        execute: async (input) => runEvaluateEnpTool(input)
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
        execute: async (input) => runCoachDealTool(input)
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
