'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
assert.match(sw,/navigationResponse/);
assert.match(sw,/assetResponse/);
assert.match(sw,/addAllSafe/);
assert.match(sw,/required\)throw/);
assert.doesNotMatch(sw,/cache\.addAll\(ASSETS\)/);
assert.doesNotMatch(sw,/caches\.match\('\.\/index\.html'\)\)\)\);/);

class FakeCache{
  constructor(){this.map=new Map();}
  async add(url){
    if(String(url).includes('missing-optional'))throw new Error('404');
    this.map.set(url,{ok:true,url,status:200});
  }
  async put(request,response){this.map.set(typeof request==='string'?request:request.url,response);}
  async match(request){return this.map.get(typeof request==='string'?request:request.url)||undefined;}
}

(async()=>{
  const cachesStore=new Map();
  const listeners={};
  const sandbox={
    importScripts(){},
    caches:{
      async open(name){if(!cachesStore.has(name))cachesStore.set(name,new FakeCache());return cachesStore.get(name);},
      async match(request){for(const cache of cachesStore.values()){const hit=await cache.match(request);if(hit)return hit;}return undefined;},
      async keys(){return [...cachesStore.keys()];},
      async delete(name){return cachesStore.delete(name);}
    },
    fetch:async request=>{
      const url=typeof request==='string'?request:request.url;
      if(String(url).includes('missing'))throw new Error('network');
      return {ok:true,status:200,clone(){return {ok:true,status:200,url};},url};
    },
    URL,
    Response:class{
      constructor(body,init={}){this.body=body;this.status=init.status;this.statusText=init.statusText;this.headers=init.headers;}
    }
  };
  sandbox.self=sandbox;
  sandbox.self.HUNTIQ_PWA_MANIFEST={
    cache:'huntiq-public-v112',
    required:['./','./index.html','./app.js'],
    optional:['./missing-optional.js']
  };
  sandbox.self.addEventListener=(type,fn)=>{listeners[type]=fn;};
  sandbox.self.skipWaiting=async()=>{};
  sandbox.self.clients={claim:async()=>{}};
  sandbox.self.location={origin:'http://127.0.0.1'};
  vm.runInNewContext(sw,sandbox,{filename:'sw.js'});

  let installPromise;
  listeners.install({waitUntil(promise){installPromise=promise;}});
  await installPromise;
  const cache=cachesStore.get('huntiq-public-v112');
  assert(cache.map.has('./index.html'),'required assets cache on install');
  assert(cache.map.has('./app.js'));
  assert(!cache.map.has('./missing-optional.js'),'optional missing assets must not fail install');

  const missing=await new Promise(resolve=>{
    listeners.fetch({
      request:{method:'GET',url:'http://127.0.0.1/missing.css',mode:'cors',destination:'style',headers:{get:()=>'text/css'}},
      respondWith(promise){resolve(promise);},
      waitUntil(){}
    });
  });
  assert.equal(missing.status,404,'asset misses must return 404, not index HTML');

  const nav=await new Promise(resolve=>{
    listeners.fetch({
      request:{method:'GET',url:'http://127.0.0.1/',mode:'navigate',destination:'document',headers:{get:()=>'text/html'}},
      respondWith(promise){resolve(promise);},
      waitUntil(){}
    });
  });
  assert.equal(nav.ok,true,'navigations still use the document response');
  console.log('pwa service-worker tests passed');
})().catch(err=>{console.error(err);process.exitCode=1;});
