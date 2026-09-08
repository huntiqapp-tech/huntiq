'use strict';

const fs=require('fs');
const path=require('path');
const assert=require('assert');
const manifest=require('../lib/pwa-cache-manifest');

function read(rel){
  return fs.readFileSync(path.join(__dirname,'..',rel),'utf8');
}

function main(){
  const pkg=JSON.parse(read('package.json'));
  const health=JSON.parse(read('health.json'));
  const sw=read('sw.js');
  const app=read('app.js');
  const html=read('index.html');
  const readme=read('README.md');
  const status=read('PROJECT_STATUS.md');

  assert.equal(pkg.version,manifest.version,'package version must match cache manifest');
  assert.equal(health.version,manifest.version);
  assert.equal(health.cache,manifest.cache);
  assert.equal(health.alertsEnabled,false);
  assert.equal(health.providerCallsFromClient,false);
  assert.match(sw,/importScripts\('\.\/lib\/pwa-cache-manifest\.js'\)/);
  assert.match(app,/HuntIQCustomerAppBoundary\.resolveCustomerAppFeed/);
  assert.match(app,/HuntIQSafeStorage\.readList/);
  assert.doesNotMatch(app,/RETAILERAPI_KEY|BRIGHTDATA_API_TOKEN/);
  assert.doesNotMatch(html,/RETAILERAPI_KEY|BRIGHTDATA_API_TOKEN/);
  assert.match(readme,/demo fallback|demonstration/i);
  assert.match(status,/0\.9\.111/);
  assert(fs.existsSync(path.join(__dirname,'..','docs/customer-app-contract.md')));
  assert(fs.existsSync(path.join(__dirname,'..','docs/customer-feed-integration-handoff.md')));
  const contract=read('docs/customer-app-contract.md');
  assert.match(contract,/HUNTIQ_CUSTOMER_FEED/);
  assert.match(contract,/buildCustomerLivePayload/);
  assert.match(contract,/buildCustomerAuthorizedLivePayload/);
  assert.match(contract,/alertsEnabled: false/);
  assert.doesNotMatch(contract,/RETAILERAPI_KEY|BRIGHTDATA_API_TOKEN/);
  assert(fs.existsSync(path.join(__dirname,'..','docs/release-readiness.md')));

  const clientFiles=['app.js','index.html','sw.js','lib/customer-app-boundary.js','lib/customer-feed-fixture.js','lib/demo-opportunities.js'];
  for(const file of clientFiles){
    const text=read(file);
    assert(!/authorization:\s*['"][^'"]+['"]/i.test(text),`${file} must not ship credentials`);
  }

  console.log('release-readiness checks passed',{version:pkg.version,cache:manifest.cache,mode:'preview-vs-production documented'});
}

module.exports={main};
if(require.main===module){
  try{main();}
  catch(err){console.error(err.message||err);process.exitCode=1;}
}
