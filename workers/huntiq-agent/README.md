# huntiq-agent

Cloudflare Workers **Think** agent stub for future [gethuntiq.com](https://gethuntiq.com) use.

This package lives beside the public GitHub Pages PWA. It does **not** replace `index.html`, `calculator.html`, or the existing static site. Origin `new_repo` was not used; the Worker stays in this HUNTIQ repository.

## What it is

- Turn owner: **Think** (`HuntiqAgent` extends `Think` from `@cloudflare/think` in `src/server.ts`).
- Job: ENP / Deal Coach stub. Users paste buy prices, sold comps, and confirmed fees.
- No scrape API keys. No Keepa, Bright Data, Oxylabs, or RetailerAPI calls.
- ENP math is locked to `lib/enp-calculator.js` by `tests/huntiq-agent-enp-contract.test.js` (same fixtures, identical outputs).
- The `/enp` and `evaluateEnp` tool paths fail closed unless `compKind` is `sold` and `soldCompsConfirmed` is true. Asking/active/cancelled listings, MSRP, rebates, store credit, and promo discounts cannot set ENP.
- The coach never claims a live pricing error.

## Local run

From this directory:

```sh
npm install
npm run dev
```

Then open `http://127.0.0.1:8787/`.

- `GET /` — stub landing page
- `GET /health` — worker / tracing status
- `POST /enp` — deterministic ENP + coach JSON (no model call)
- Think chat protocol — `routeAgentRequest` to the `HuntiqAgent` Durable Object

Local chat needs a Workers AI binding (`AI` in `wrangler.jsonc`). The `/enp` helper works without a model.

Do **not** run `wrangler deploy` from this repo unless a human explicitly asks. This stub is not production gethuntiq.com.

## Typecheck and dry-run

```sh
npm run typecheck
npm run dry-run
npm test
```

`npm run typecheck` regenerates `worker-configuration.d.ts` via `wrangler types` (that file is gitignored).

`AGENT.md` is a review-packet snapshot of `wrangler.jsonc`, `src/http.ts`, `src/enp.ts`, and `src/server.ts`. It sorts before `package-lock.json` so truncated automated reviews can still see the fail-closed `/enp` path. Do not edit it by hand; regenerate it from those files if they change.

Root CI also runs:
- `tests/huntiq-agent-http.test.js` against `handlePublicRequest` (malformed JSON, missing gate, asking prices, sold success)
- `tests/huntiq-agent-enp-contract.test.js` against `lib/enp-calculator.js`
- `tests/huntiq-agent-wrangler.test.js` for tracing, secret-pattern, and AGENT.md snapshot checks

`npm run dry-run` is `wrangler deploy --dry-run` only. It must not publish the Worker.

## Tracing (metadata only)

`wrangler.jsonc` enables Workers traces at 100% sampling:

```jsonc
"observability": {
  "traces": {
    "enabled": true,
    "head_sampling_rate": 1
  }
}
```

Think instruments turns automatically. **Content is metadata only.** `storeMessages` and `storeTools` are left at the Think default (`false`). Do not set them to `true` unless a human explicitly chooses to store LLM messages and tool payloads.

After a future deploy, view traces in the Cloudflare dashboard:

1. Workers & Pages → **huntiq-agent**
2. Observability → Traces, or the **Agents** tab
3. Session replay will stay limited because payloads are not stored

Docs: [Agent tracing](https://developers.cloudflare.com/agents/runtime/operations/observability/tracing/) and [Workers traces](https://developers.cloudflare.com/workers/observability/traces/).

## Attach gethuntiq.com later

Do not add the custom domain until a human is ready to move the hostname off GitHub Pages (or onto a subdomain). Attaching `gethuntiq.com` as a Worker Custom Domain points the whole hostname at this Worker.

When ready, in a Cloudflare zone you own:

1. Deploy this Worker to a real account (`npx wrangler deploy` — not done here).
2. In the dashboard: Worker → Settings → Domains & Routes → Add → Custom Domain → `gethuntiq.com`.
3. Or add to `wrangler.jsonc` and deploy:

```jsonc
"routes": [
  { "pattern": "gethuntiq.com", "custom_domain": true }
]
```

See [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/). If the public PWA should stay on GitHub Pages, attach a subdomain such as `agent.gethuntiq.com` instead of the apex.

## Secrets

This package must stay secret-free. Do not commit API tokens, `.dev.vars`, or scrape credentials. Workers AI uses the `AI` binding, not a repo-stored key.
