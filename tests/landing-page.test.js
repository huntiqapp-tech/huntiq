'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function matches(source, pattern) {
  return source.match(pattern) || [];
}

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
assert.deepStrictEqual(duplicateIds, [], `duplicate IDs: ${duplicateIds.join(', ')}`);

assert.strictEqual(matches(html, /<h1\b/g).length, 1, 'exactly one h1');
assert(html.includes('class="skip-link"') && html.includes('href="#main"'), 'skip link targets main');
assert(html.includes('<header') && html.includes('<main id="main"') && html.includes('<footer') && html.includes('<nav'), 'landmarks present');
assert(html.includes('Demo preview — no purchasing automation.'), 'explicit demo disclaimer');
assert(html.includes('Know which clearance deals are worth the trip'), 'plain-language headline');
assert(html.includes('Join early access') && html.includes('See a sample deal'), 'primary and secondary CTAs');
assert(html.includes('id="opportunities"') && html.includes('id="dealGrid"') && html.includes('id="dealTemplate"'), 'interactive demo retained');
assert(html.includes('id="live-announcer"') && html.includes('aria-live="polite"'), 'live region for watch/filter changes');
assert(html.includes('data-filter="live"') && html.includes('data-filter="demo"'), 'live/demo filters are in markup for aria-pressed wiring');
assert(html.includes('aria-pressed="true"') && html.includes('aria-expanded="false"'), 'pressed/expanded states present');
assert(html.includes('role="progressbar"') && html.includes('aria-valuemin="0"') && html.includes('aria-valuemax="100"'), 'confidence has progress semantics');
assert(html.includes('18360') && /store\/ZIP|store\/ZIP location key|sample store\/ZIP/i.test(html), 'ZIP provenance explained');
assert(!/testimonial|users love|\d+\s+users|guaranteed (profit|savings|roi)|live price error/i.test(html), 'no unsupported social proof or live-error claims');
assert(!html.includes('6 Launch sources') && !html.includes('Initial local market'), 'legacy source-count and unexplained ZIP metric removed');
assert(!/\.(png|jpe?g|webp)/i.test(html), 'no untreated raster promo image');

const faqButtons = [...html.matchAll(/aria-controls="(faq-a\d+)"/g)].map(m => m[1]);
assert.strictEqual(faqButtons.length, 5, 'FAQ disclosures have unique controls');
assert.strictEqual(new Set(faqButtons).size, faqButtons.length, 'FAQ aria-controls IDs are unique');
for (const id of faqButtons) {
  assert(html.includes(`id="${id}"`), `FAQ panel ${id} exists`);
}

const sourceStatuses = [...app.matchAll(/status:'(Connected|Evaluating|Restricted)'/g)].map(m => m[1]);
assert.strictEqual(sourceStatuses.length, 7, 'seven tracked sources in app.js');
assert.strictEqual(sourceStatuses.filter(s => s === 'Connected').length, 0, 'no live connected customer feeds claimed');
assert.strictEqual(sourceStatuses.filter(s => s === 'Evaluating').length, 5, 'five evaluating sources');
assert.strictEqual(sourceStatuses.filter(s => s === 'Restricted').length, 2, 'two restricted sources');
assert(html.includes('0 connected · 5 evaluating · 2 restricted · 7 tracked sources'), 'landing summary matches source inventory');
assert(html.includes('id="landingSourceGrid"') && html.includes('id="sourceGrid"'), 'landing and demo source grids share one inventory');
assert(app.includes("status:'Evaluating'") && app.includes("status:'Restricted'"), 'source labels are Connected/Evaluating/Restricted');
assert(app.includes("setAttribute('aria-pressed'") && app.includes("setAttribute('aria-expanded'") && app.includes("setAttribute('role','progressbar')"), 'deal cards set pressed/expanded/progress semantics');
assert(app.includes('comp-panel-${d.id}') && app.includes('announce('), 'unique details IDs and live announcements');
assert(app.includes('sourceSummaryText') && app.includes('[data-source-grid]'), 'source counts render from one array');

assert(css.includes('.skip-link') && css.includes(':focus-visible') && css.includes('prefers-reduced-motion'), 'a11y CSS primitives present');
assert(css.includes('overflow-x:clip') && !css.includes('100vw'), 'overflow guarded without 100vw');
assert(css.includes('--target:44px') && css.includes('min-height:var(--target)'), '44px touch targets');
assert(css.includes('grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)'), 'two-column hero');
assert(css.includes('@media(max-width:768px)') && css.includes('@media(max-width:460px)') && css.includes('@media(max-width:1024px)'), 'responsive breakpoints cover mobile through desktop');
assert(css.includes('aspect-ratio:16/10') && css.includes('min-height:140px'), 'hero media box reserves dimensions');

const cacheMatch = sw.match(/const CACHE='huntiq-public-v(\d+)'/);
assert(cacheMatch, 'service worker cache version present');
assert.strictEqual(`0.9.${cacheMatch[1]}`, pkg.version, 'cache version matches package version atomically');
assert(sw.includes("'./index.html'") && sw.includes("'./styles.css'") && sw.includes("'./app.js'") && sw.includes("'./manifest.webmanifest'"), 'SW precache includes landing assets');
assert(html.includes('href="./manifest.webmanifest"'), 'manifest linked from the landing document');
assert(app.includes("navigator.serviceWorker.register('./sw.js')"), 'install/offline registration preserved');
assert(manifest.includes('"start_url":"./"') && manifest.includes('"display":"standalone"'), 'PWA manifest preserved');
assert(html.includes('id="installBtn"'), 'install control preserved');

const requiredDemoHooks = [
  "d.observedAt||d.timestamp||new Date().toISOString()",
  "Array.isArray(d.priceHistory)?d.priceHistory:[]",
  "d.dataOrigin==='demo'?'Demo sold':'Verified sold'"
];
for (const hook of requiredDemoHooks) {
  assert(app.includes(hook), `presentation changes preserved domain hook: ${hook}`);
}

console.log('landing page tests passed', {
  version: pkg.version,
  cache: cacheMatch[0],
  sources: sourceStatuses.length,
  faq: faqButtons.length,
  ids: ids.length
});
