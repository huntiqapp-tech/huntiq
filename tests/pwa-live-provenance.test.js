'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

assert(app.includes('function evidenceIdentity(d)'), 'PWA must derive evidence identity from each opportunity');
assert(app.includes("source:demo?'demo':(d.source?.provider||'validated-live')"), 'live customer opportunities must preserve provider provenance');
assert(app.includes("verified:demo||d.validationState==='validated'"), 'live evidence may only be marked verified after validation');
assert(app.includes("const historyReady=demo||d.liveReadiness?.historyDisposition==='validated-history';if(!historyReady)return;"), 'non-promoted live observations must not be persisted into browser history');
assert(!app.includes("HuntIQQuality.evidenceQuality({source:'demo'"), 'live evidence must never be hard-coded as demo evidence');
assert(!app.includes("source:'demo-current',verified:true"), 'live snapshots must never be written with demo provenance');

console.log('PWA live provenance tests passed');
