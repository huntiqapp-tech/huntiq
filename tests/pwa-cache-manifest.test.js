'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const manifest=require('../lib/pwa-cache-manifest');

assert.equal(manifest.version,'0.9.112');
assert.equal(manifest.cache,'huntiq-public-v112');
assert(manifest.required.includes('./index.html'));
assert(manifest.required.includes('./app.js'));
assert(manifest.required.includes('./lib/customer-app-boundary.js'));
assert(manifest.required.includes('./lib/safe-storage.js'));
assert(manifest.optional.includes('./health.json'));

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','package.json'),'utf8'));
const health=JSON.parse(fs.readFileSync(path.join(__dirname,'..','health.json'),'utf8'));

assert.equal(pkg.version,manifest.version);
assert.equal(health.version,manifest.version);
assert.equal(health.cache,manifest.cache);
assert.match(sw,/importScripts\('\.\/lib\/pwa-cache-manifest\.js'\)/);
assert.match(sw,/isNavigationRequest/);
assert.match(sw,/status:404/);
assert(!/return refresh\.then\(response=>response\|\|caches\.match\('\.\/index\.html'\)\)/.test(sw),'asset misses must not fall back to index HTML');

const hrefs=[...html.matchAll(/href="(\.\/[^"]+)"/g)].map(m=>m[1]).filter(href=>!href.startsWith('./#'));
const scripts=[...html.matchAll(/src="(\.\/lib\/[^"]+|(\.\/app\.js))"/g)].map(m=>m[1]);
const referenced=[...new Set([...hrefs.filter(h=>/\.(css|webmanifest|svg)$/.test(h)),...scripts,'./index.html','./'])];
for(const asset of referenced){
  assert(manifest.required.includes(asset)||manifest.assets.includes(asset),`index.html references ${asset} which is missing from the cache manifest`);
}

const missingFiles=manifest.required.filter(asset=>asset!=='./'&&!fs.existsSync(path.join(__dirname,'..',asset.replace(/^\.\//,''))));
assert.deepEqual(missingFiles,[],'required PWA assets must exist on disk');

for(const asset of manifest.assets){
  if(asset==='./')continue;
  const file=path.join(__dirname,'..',asset.replace(/^\.\//,''));
  if(!fs.existsSync(file))continue;
  const text=fs.readFileSync(file,'utf8');
  assert(!/RETAILERAPI_KEY|BRIGHTDATA_API_TOKEN|apiKey\s*[:=]\s*['"](?!unit-test)/.test(text),`${asset} must not embed provider secrets`);
}

console.log('pwa cache-manifest tests passed');
