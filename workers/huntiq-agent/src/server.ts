import { Think } from "@cloudflare/think";
import { routeAgentRequest } from "agents";
import { tool } from "ai";
import { z } from "zod";
import { coachDeal, coachFromEnp } from "./coach.ts";
import { evaluateEnp, TRUST_LINE } from "./enp.ts";

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
  minProfit: z.number().optional().describe("Minimum profit dollars. Defaults to 15.")
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
          feesAreConfirmed: z.boolean().optional()
        }),
        execute: async (input) => coachDeal(input)
      })
    };
  }
}

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
        <li>POST /enp with the same user-supplied numbers as the calculator</li>
      </ul>
      <pre>curl -s http://127.0.0.1:8787/enp \\
  -H 'content-type: application/json' \\
  -d '{"buyPrice":20,"sellPrice":80,"fbaOrShipOut":10,"marketplace":"amazon-fba"}'</pre>
    </main>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env) {
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
      const enp = evaluateEnp((body ?? {}) as Record<string, unknown>);
      if (!enp.ok) return json(enp, 400);
      return json({
        ...enp,
        coach: coachFromEnp(enp, {
          feesAreConfirmed: Boolean((body as { feesAreConfirmed?: boolean }).feesAreConfirmed)
        })
      });
    }

    return (
      (await routeAgentRequest(request, env, { cors: true })) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
