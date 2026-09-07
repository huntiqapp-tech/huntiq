import { coachFromEnp } from "./coach.ts";
import { TRUST_LINE, type EnpInput } from "./enp.ts";
import { runEvaluateEnpTool } from "./tools.ts";

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
    const enp = runEvaluateEnpTool((body ?? {}) as EnpInput);
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
